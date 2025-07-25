import { FastifyRequest, FastifyReply } from 'fastify'
import { deleteUserById } from '@/services/user.services'

// Suppression par l'utilisateur connecté
export async function deleteOwnAccount(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.session.user?.id
  if (!userId) return reply.code(401).send({ error: 'Non authentifié' })

  await deleteUserById(request.server, userId)
  await request.session.destroy() // 👈 c’est bien ça la bonne méthode
  reply.send({ message: 'Compte supprimé' })
}

// Suppression par un admin
export async function deleteUserByAdmin(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string }
  await deleteUserById(request.server, id)
  reply.send({ message: 'Utilisateur supprimé par un admin' })
}