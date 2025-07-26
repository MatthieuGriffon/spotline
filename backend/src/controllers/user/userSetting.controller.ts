import { FastifyRequest, FastifyReply } from 'fastify'
import { getSessionUser } from '@/utils/getSessionUser'
import { getUserPreferences,updateUserPreferences } from '@/services/user/user.services'

export async function getUserSettingsHandler(request: FastifyRequest, reply: FastifyReply) {
  const userId = getSessionUser(request).id
  const prefs = await getUserPreferences(request.server, userId)
  reply.send(prefs)
}

export async function updateUserSettingsHandler(
  request: FastifyRequest<{
    Body: {
      darkMode?: boolean
      mapTile?: string
      notifications?: boolean
    }
  }>,
  reply: FastifyReply
) {
  const userId = getSessionUser(request).id
  const prefs = request.body

  await updateUserPreferences(request.server, userId, prefs)

  reply.send({ message: 'Préférences mises à jour ✅' })
}