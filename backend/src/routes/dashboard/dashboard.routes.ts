import { FastifyInstance } from 'fastify'
import { requireAuth } from '@/middlewares/requireAuth'
import { getUserDashboardHandler } from '@/controllers/dashboard/dashboard.controller'
import { UserDashboardResponse } from '@/schemas/dashboard/dashboard.schema'

export async function dashboardRoutes(fastify: FastifyInstance) {
  fastify.get('/dashboard', {
    preHandler: [requireAuth],
    schema: {
      tags: ['user'],
      summary: 'Récupérer les données du tableau de bord utilisateur',
      response: {
        200: UserDashboardResponse
      }
    },
    handler: getUserDashboardHandler
  })
}