import type { SessionUser } from "@/types/fastify";
import { FastifyRequest, FastifyReply } from "fastify";
import { RegisterBody } from "@/schemas/auth/auth.schema";
import { LoginBody } from "@/schemas/auth/login.schema";
import {
  loginUser,
  registerUser,
  changePassword,
  confirmPasswordChange,
  forgotPassword,
  resetPassword,
  requestEmailChange,
} from "@/services/auth/auth.service";
import { ChangePasswordBody } from "@/schemas/auth/changePassword.schema";
import { confirmEmailToken } from "@/services/emailConfirmationService";
import { createAccountSession } from "@/services/user/user.services";
import { linkEmailInvitationsOnLogin } from "@/services/groupes/invitations.service";

type ConfirmBody = { token: string }
// Helper pour transformer un user DB → SessionUser
function toSessionUser(user: any): SessionUser {
  return {
    id: user.id,
    email: user.email,
    pseudo: user.pseudo,
    role: user.role,
    imageUrl: user.imageUrl ?? null,
    isConfirmed: user.isConfirmed ?? false,
  };
}

export async function register(
  request: FastifyRequest<{ Body: (typeof RegisterBody)["static"] }>,
  reply: FastifyReply
) {
  const { email, password, pseudo } = request.body;
  const user = await registerUser(request.server, email, password, pseudo);

  reply.code(200).send({ message: "Compte créé. Vérifie ta boîte mail" });
}

export async function confirmEmailHandler(
  request: FastifyRequest<{ Params: { token: string } }>,
  reply: FastifyReply
) {
  const { token } = request.params;
  const { user } = await confirmEmailToken(request.server, token);

  request.session.user = toSessionUser(user);

  reply.send({
    message: "Email confirmé et connecté",
    user: {
      id: user.id,
      email: user.email,
      pseudo: user.pseudo,
      role: user.role,
    },
  });
}

export async function confirmEmailViaQuery(
  request: FastifyRequest<{ Querystring: { token: string } }>,
  reply: FastifyReply
) {
  const { token } = request.query;
  const { user } = await confirmEmailToken(request.server, token);

  request.session.user = toSessionUser(user);

  reply.send({
    message: "Email confirmé et connecté",
    user: {
      id: user.id,
      email: user.email,
      pseudo: user.pseudo,
      role: user.role,
    },
  });
}

export async function login(
  request: FastifyRequest<{ Body: (typeof LoginBody)["static"] }>,
  reply: FastifyReply
) {
  const { email, password } = request.body;
  const user = await loginUser(request.server, email, password);

  const ip = request.ip;
  const userAgent = request.headers["user-agent"] || "";

  const session = await createAccountSession(
    request.server,
    user.id,
    userAgent,
    ip
  );

  request.session.user = toSessionUser(user);
  request.session.accountSessionId = session.id;

  // 👇 Lie les invitations envoyées à l'email au compte fraîchement connecté (reste en PENDING)
  if (user.email) {
    try {
      await linkEmailInvitationsOnLogin(request.server, {
        userId: user.id,
        email: user.email,
      });
    } catch (e) {
      request.log.warn({ e }, "linkEmailInvitationsOnLogin failed");
    }
  }

  reply.send({ message: "Connexion réussie" });
}

export async function logout(request: FastifyRequest, reply: FastifyReply) {
  await request.session.destroy();
  reply.send({ message: "Déconnecté avec succès" });
}

export async function getMe(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.session.user?.id;
    if (!userId) return reply.unauthorized("Non authentifié");

    const fullUser = await request.server.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        pseudo: true,
        role: true,
        imageUrl: true,
        isConfirmed: true,
      },
    });
    if (!fullUser) return reply.notFound("Utilisateur introuvable");

    // 👇 Filet de sécurité : lie les invitations envoyées à l'email au compte (reste en PENDING)
    if (fullUser.email) {
      try {
        await linkEmailInvitationsOnLogin(request.server, {
          userId: fullUser.id,
          email: fullUser.email,
        });
      } catch (e) {
        request.log.warn({ e }, "linkEmailInvitationsOnLogin failed (getMe)");
        // on n’interrompt pas la réponse /auth/me
      }
    }

    // Tu gardes exactement le même payload qu’avant
    reply.send(fullUser);
  } catch (err) {
    request.log.error({ err }, "[ERREUR /auth/me]");
    reply.internalServerError(
      "Erreur lors de la récupération de l'utilisateur"
    );
  }
}

export async function changePasswordHandler(
  request: FastifyRequest<{ Body: (typeof ChangePasswordBody)["static"] }>,
  reply: FastifyReply
) {
  if (!request.session.user) {
    return reply.unauthorized("Authentification requise");
  }

  const { oldPassword, newPassword } = request.body;
  await changePassword(
    request.server,
    request.session.user.id,
    oldPassword,
    newPassword
  );

  reply.send({ message: "Mot de passe modifié avec succès 🔒" });
}

export async function confirmPasswordChangeHandler(
  req: FastifyRequest<{ Body: { token: string } }>,
  reply: FastifyReply
) {
  const { token } = req.body;
  const result = await confirmPasswordChange(req.server, token);

  try {
    await req.session.destroy();
  } catch {}

  const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "sid";
  reply.clearCookie(COOKIE_NAME, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return reply.send(result);
}

export async function requestEmailChangeHandler(
  request: FastifyRequest<{ Body: { newEmail: string } }>,
  reply: FastifyReply
) {
  const userId = request.session.user?.id;
  if (!userId) return reply.unauthorized("Non authentifié");

  const { newEmail } = request.body;
  await requestEmailChange(request.server, userId, newEmail);

  reply.send({ message: "Un email de confirmation a été envoyé." });
}

export async function forgotPasswordHandler(
  request: FastifyRequest<{ Body: { email: string } }>,
  reply: FastifyReply
) {
  const { email } = request.body;
  await forgotPassword(request.server, email);
  reply.send({ message: "Si ce compte existe, un email a été envoyé." });
}

export async function resetPasswordHandler(
  request: FastifyRequest<{ Body: { token: string; newPassword: string } }>,
  reply: FastifyReply
) {
  const { token, newPassword } = request.body;
  const result = await resetPassword(request.server, token, newPassword);

  // détruire la session côté serveur (si présente)
  try {
    await request.session.destroy();
  } catch {}

  // effacer le cookie côté client
  const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "sid";
  reply.clearCookie(COOKIE_NAME, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return reply.send(result);
}
