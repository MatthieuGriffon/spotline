import { FastifyInstance } from 'fastify'
import {
  getReportedPrisesController,
  moderatePriseController
} from '@/controllers/admin/reportedPrises.controller'
import { getReportedPrisesSchema, moderatePriseSchema } from '@/schemas/admin/reportedPrises.schema'
import { requireAuth } from '@/middlewares/requireAuth'
import { adminGuard } from '@/middlewares/adminGuard'

export async function reportedPrisesRoutes(fastify: FastifyInstance) {
  fastify.get('/admin/reported-prises', {
    preHandler: [requireAuth, adminGuard],
    schema: getReportedPrisesSchema,
    handler: getReportedPrisesController
  })

  fastify.put('/admin/reported-prises/:priseId/moderate', {
    preHandler: [requireAuth, adminGuard],
    schema: moderatePriseSchema,
    handler: moderatePriseController
  })
}