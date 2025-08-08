import { FastifyInstance } from "fastify";

export async function confirmEmailToken(
  fastify: FastifyInstance,
  token: string
) {
  const now = new Date();

  const result = await fastify.prisma.$transaction(async (tx) => {
    const entry = await tx.emailConfirmationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!entry || entry.expiresAt < now) {
      // Idempotent: supprime silencieusement si présent
      await tx.emailConfirmationToken.deleteMany({ where: { token } });
      return { ok: false as const, message: "Token invalide ou expiré" };
    }

    const u = entry.user;
    const updated = await tx.user.update({
      where: { id: u.id },
      data: u.pendingEmail
        ? { email: u.pendingEmail, pendingEmail: null, isConfirmed: true }
        : { isConfirmed: true },
    });

    // Idempotent aussi ici
    await tx.emailConfirmationToken.deleteMany({ where: { token } });

    return {
      ok: true as const,
      message: u.pendingEmail
        ? "Nouvelle adresse email confirmée."
        : "Compte confirmé.",
      user: updated,
    };
  });

  if (!result.ok) {
    throw fastify.httpErrors.badRequest(result.message);
  }

  fastify.log.info(`[AUTH] ${result.message} pour ${result.user.email} ✉️`);

  const { id, email, role, pseudo, imageUrl, isConfirmed } = result.user;
  return { user: { id, email, role, pseudo, imageUrl, isConfirmed } };
}
