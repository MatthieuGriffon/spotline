import { FastifyRequest, FastifyReply } from 'fastify'
import { getAdminDashboardStats } from '@/services/admin/stats.service'

export async function getStatsHandler(request: FastifyRequest, reply: FastifyReply) {
  const stats = await getAdminDashboardStats(request.server)
  return stats
}