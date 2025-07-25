import { FastifyInstance } from 'fastify'
import fs from 'fs/promises'
import path from 'path'

export async function deleteUserById(fastify: FastifyInstance, userId: string) {
  const user = await fastify.prisma.user.findUnique({ where: { id: userId } })
  if (!user) return

  // Supprimer l’avatar du disque si présent
  if (user.imageUrl) {
    const avatarPath = path.join('uploads/avatars', path.basename(user.imageUrl))
    try {
      await fs.unlink(avatarPath)
    } catch (err) {
      fastify.log.warn(`Erreur suppression avatar : ${err}`)
    }
  }

  // Facultatif : anonymiser ou supprimer les prises/sessions liées
  await fastify.prisma.prise.deleteMany({ where: { userId } })
  await fastify.prisma.session.deleteMany({ where: { organizerId: userId } })
  await fastify.prisma.sessionInvite.deleteMany({ where: { userId } })
  await fastify.prisma.emailConfirmationToken.deleteMany({ where: { userId } })

  // Supprimer le compte
  await fastify.prisma.user.delete({ where: { id: userId } })
}