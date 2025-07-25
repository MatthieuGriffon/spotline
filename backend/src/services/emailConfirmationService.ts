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

  const user = record.user

  await fastify.prisma.$transaction([
    fastify.prisma.user.update({
      where: { id: user.id },
      data: user.pendingEmail
        ? {
            email: user.pendingEmail,
            pendingEmail: null
          }
        : {
            isConfirmed: true
          }
    }),
    fastify.prisma.emailConfirmationToken.delete({
      where: { token }
    })
  ])

  const finalUser = await fastify.prisma.user.findUniqueOrThrow({
    where: { id: user.id }
  })

  const { id, email, role, pseudo } = finalUser
  fastify.log.info(`[AUTH] ${user.pendingEmail ? 'Changement d’email' : 'Activation'} de ${email} confirmé ✉️`)

  return {
    user: { id, email, role, pseudo }
  }
}