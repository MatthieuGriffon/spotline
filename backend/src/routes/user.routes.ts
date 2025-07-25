import { FastifyPluginAsync } from 'fastify'
import { deleteOwnAccount, deleteUserByAdmin } from '@/controllers/user.controller'
import { DeleteUserParams } from '@/schemas/deleteUser.schema'
import { requireAuth } from '@/middlewares/requireAuth'
import { adminGuard } from '@/middlewares/adminGuard'

const userRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.delete('/user', { preHandler: [requireAuth] }, deleteOwnAccount)

  fastify.delete('/user/:id', {
  preHandler: [requireAuth, adminGuard], // 💡 requireAuth d'abord !
  schema: { params: DeleteUserParams }
}, deleteUserByAdmin)
}

export default userRoutes