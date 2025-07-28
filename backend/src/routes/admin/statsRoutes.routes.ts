import { FastifyInstance } from 'fastify'
import { getStatsHandler } from '@/controllers/admin/stats.controller'
import { AdminStatsResponse } from '@/schemas/admin/stats.schema'
import { requireAuth } from '@/middlewares/requireAuth'
import { adminGuard } from '@/middlewares/adminGuard'

export async function adminStatsRoutes(fastify: FastifyInstance) {
  fastify.get('/stats', {
     preHandler: [requireAuth, adminGuard],
    schema: {
      tags: ['admin'],
      summary: 'Statistiques globales du dashboard admin',
      response: { 200: AdminStatsResponse }
    },
    handler: getStatsHandler
  })
}