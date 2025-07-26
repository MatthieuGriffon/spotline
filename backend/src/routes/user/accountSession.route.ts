import { FastifyInstance } from 'fastify'
import {
  getAccountSessionsHandler,
  deleteAccountSessionHandler,
  deleteAllAccountSessionsExceptCurrentHandler
} from '@/controllers/user/accountSession.controller'
import { requireAuth } from '@/middlewares/requireAuth'

export async function accountSessionRoutes(fastify: FastifyInstance) {
  fastify.get('/user/sessions', { preHandler: requireAuth }, getAccountSessionsHandler)

  fastify.delete<{
  Params: { id: string }
}>('/user/sessions/:id', { preHandler: requireAuth }, deleteAccountSessionHandler)

  fastify.delete('/user/sessions', { preHandler: requireAuth }, deleteAllAccountSessionsExceptCurrentHandler)
}