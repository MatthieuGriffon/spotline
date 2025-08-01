import { FastifyReply, FastifyRequest } from 'fastify'
import { getReportedPrises, moderatePrise } from '@/services/admin/reportedPrises.service'

export async function getReportedPrisesController(req: FastifyRequest, reply: FastifyReply) {
  const data = await getReportedPrises(req.server)
  reply.send(data)
}

export async function moderatePriseController(
  req: FastifyRequest<{ Params: { priseId: string }, Body: { action: 'mask' | 'delete' | 'ignore' } }>,
  reply: FastifyReply
) {
  const { action } = req.body
  const result = await moderatePrise(req, action)
  reply.send(result)
}