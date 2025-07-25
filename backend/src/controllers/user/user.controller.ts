import { FastifyRequest, FastifyReply } from 'fastify'
import { deleteUserById } from '@/services/user/user.services'
import { updateUserPseudo } from '@/services/user/user.services'
import { UpdatePseudoBody } from '@/schemas/user/updatePseudo.schema'

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

export async function changePseudo(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.session.user?.id
  if (!userId) return reply.unauthorized('Non authentifié')

  const { pseudo } = request.body as { pseudo: string }

  await updateUserPseudo(request.server, userId, pseudo)

  reply.send({ message: 'Pseudo mis à jour' })
}