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

    console.debug("[DEBUG] getMe - Full user:", fullUser);
    reply.send(fullUser);
  } catch (err) {
    console.error("[ERREUR /auth/me]", err);
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
  request: FastifyRequest<{ Body: { token: string } }>,
  reply: FastifyReply
) {
  const { token } = request.body;
  const user = await confirmPasswordChange(request.server, token);

  request.session.user = toSessionUser(user);

  reply.send({ message: "Mot de passe modifié avec succès 🎉" });
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
  await resetPassword(request.server, token, newPassword);
  reply.send({ message: "Mot de passe réinitialisé avec succès 🎉" });
}
