import { FastifyPluginAsync } from 'fastify'
import { deleteOwnAccount, deleteUserByAdmin,changePseudo } from '@/controllers/user/user.controller'
import { DeleteUserParams } from '@/schemas/user/deleteUser.schema'
import { UpdatePseudoBody } from '@/schemas/user/updatePseudo.schema'
import { UserSettingsBody, UserSettingsResponse } from '@/schemas/user/userSettings.schema'
import { requireAuth } from '@/middlewares/requireAuth'
import { adminGuard } from '@/middlewares/adminGuard'
import { uploadAvatar } from '@/controllers/user/user.controller'
import { getUserSettingsHandler, updateUserSettingsHandler } from '@/controllers/user/userSetting.controller'



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

  fastify.post('/user/avatar', {
  preHandler: [requireAuth]
}, uploadAvatar)

  fastify.get('/user/settings', {
    preHandler: requireAuth
  }, getUserSettingsHandler)

   fastify.put<{
    Body: typeof UserSettingsBody['static']
  }>('/user/settings', {
    preHandler: requireAuth,
    schema: {
      body: UserSettingsBody,
      response: {
        200: UserSettingsResponse
      },
      tags: ['user'],
      summary: 'Mettre à jour les préférences utilisateur'
    }
  }, updateUserSettingsHandler)
}

export default userRoutes