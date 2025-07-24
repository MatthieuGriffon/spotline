import { FastifyInstance } from 'fastify'

export async function confirmEmailToken(fastify: FastifyInstance, token: string) {
  const record = await fastify.prisma.emailConfirmationToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!record) {
    throw fastify.httpErrors.notFound('Token invalide ou expiré')
  }

  if (record.expiresAt < new Date()) {
    await fastify.prisma.emailConfirmationToken.delete({ where: { token } })
    throw fastify.httpErrors.badRequest('Token expiré')
  }

  await fastify.prisma.$transaction([
    fastify.prisma.user.update({
      where: { id: record.userId },
      data: { isConfirmed: true },
    }),
    fastify.prisma.emailConfirmationToken.delete({
      where: { token },
    }),
  ])

  // Création automatique de session (connexion)
  const { id, email, role, pseudo } = record.user
  fastify.log.info(`[AUTH] Connexion auto de ${email} après confirmation ✉️`)

  return {
    user: { id, email, role, pseudo },
  }
}