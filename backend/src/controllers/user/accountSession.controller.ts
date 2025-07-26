import { FastifyRequest, FastifyReply } from 'fastify'
import { getSessionUser } from '@/utils/getSessionUser'
import {
  getUserSessions,
  deleteUserSession,
  deleteOtherSessions
} from '@/services/user/user.services'

export async function getAccountSessionsHandler(request: FastifyRequest, reply: FastifyReply) {
  const userId = getSessionUser(request).id
  const sessions = await getUserSessions(request.server, userId)
  reply.send(sessions)
}

export async function deleteAccountSessionHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const userId = getSessionUser(request).id
  const sessionId = request.params.id

  if (sessionId === request.session.accountSessionId) {
    return reply.badRequest('Impossible de supprimer ta session actuelle.')
  }

  await deleteUserSession(request.server, userId, sessionId)
  reply.code(204).send()
}

export async function deleteAllAccountSessionsExceptCurrentHandler(request: FastifyRequest, reply: FastifyReply) {
  const userId = getSessionUser(request).id
  const currentSessionId = request.session.accountSessionId
  if (!currentSessionId) return reply.code(400).send({ error: 'Pas de session active' })

  await deleteOtherSessions(request.server, userId, currentSessionId)
  reply.code(204).send()
}
