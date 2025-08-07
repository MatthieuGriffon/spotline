import { FastifyRequest, FastifyReply } from 'fastify'
import { getUserDashboardData } from '@/services/dashboard/dashboard.dashboard.service'

export async function getUserDashboardHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.session.user?.id

  if (!userId) {
    return reply.code(401).send({ error: 'Non authentifié' })
  }

  const data = await getUserDashboardData(request.server, userId)
  return reply.send(data)
}