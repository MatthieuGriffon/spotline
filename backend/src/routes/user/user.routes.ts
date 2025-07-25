import { FastifyPluginAsync } from 'fastify'
import { deleteOwnAccount, deleteUserByAdmin,changePseudo } from '@/controllers/user/user.controller'
import { DeleteUserParams } from '@/schemas/user/deleteUser.schema'
import { UpdatePseudoBody } from '@/schemas/user/updatePseudo.schema'
import { requireAuth } from '@/middlewares/requireAuth'
import { adminGuard } from '@/middlewares/adminGuard'

const userRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.delete('/user', { preHandler: [requireAuth] }, deleteOwnAccount)

  fastify.delete('/user/:id', {
  preHandler: [requireAuth, adminGuard], // 💡 requireAuth d'abord !
  schema: { params: DeleteUserParams }
}, deleteUserByAdmin)

  fastify.put('/user/pseudo', {
    preHandler: [requireAuth],
    schema: { body: UpdatePseudoBody }
  }, changePseudo)
}

export default userRoutes