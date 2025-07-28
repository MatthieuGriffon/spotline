import { FastifyInstance } from 'fastify'
import { requireAuth } from '@/middlewares/requireAuth'
import { adminGuard } from '@/middlewares/adminGuard'
import {
  getAllUsersHandler,
  updateUserByAdminHandler
} from '@/controllers/admin/user.controller'
import {
  UpdateUserByAdminBody,
  UserAdminArrayResponse,
  UserAdminResponse
} from '@/schemas/admin/user.schema'
import { Type } from '@sinclair/typebox'

export async function adminUserRoutes(fastify: FastifyInstance) {
  fastify.get('/admin/users', {
    preHandler: [requireAuth, adminGuard],
    schema: {
      tags: ['admin'],
      summary: 'Lister tous les utilisateurs',
      response: {
        200: UserAdminArrayResponse
      }
    },
    handler: getAllUsersHandler
  })

  fastify.put('/admin/users/:id', {
    preHandler: [requireAuth, adminGuard],
    schema: {
      tags: ['admin'],
      summary: 'Modifier un utilisateur',
      params: Type.Object({ id: Type.String() }),
      body: UpdateUserByAdminBody,
      response: {
        200: UserAdminResponse
      }
    },
    handler: updateUserByAdminHandler
  })
}