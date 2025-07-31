import { FastifyInstance } from 'fastify'
import { getModerationLogsController } from '@/controllers/admin/moderationLog.controller'
import { getModerationLogsSchema } from '@/schemas/admin/getModerationLogsSchema'
import { requireAuth } from '@/middlewares/requireAuth'
import { adminGuard } from '@/middlewares/adminGuard'

export async function moderationLogRoutes(fastify: FastifyInstance) {
  fastify.get('/moderation-logs', {
    preHandler: [requireAuth, adminGuard],
    schema: getModerationLogsSchema,
    handler: getModerationLogsController
  })
} 