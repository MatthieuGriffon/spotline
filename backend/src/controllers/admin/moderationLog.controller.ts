import { FastifyReply, FastifyRequest } from 'fastify'
import { getModerationLogs } from '@/services/admin/getModerationLogs.service'

export async function getModerationLogsController(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const logs = await getModerationLogs(req.server)
  reply.send(logs)
}