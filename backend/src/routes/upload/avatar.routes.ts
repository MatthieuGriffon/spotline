import { FastifyPluginAsync } from 'fastify'
import path from 'path'
import fs from 'fs/promises'

const avatarRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/uploads/avatar/:filename', async (request, reply) => {
    const { filename } = request.params as { filename: string }

    if (!request.session.user) {
      return reply.unauthorized('Tu dois être connecté pour accéder aux avatars.')
    }

    const filePath = path.join(__dirname, '../../../uploads/avatars', filename)

    try {
      const ext = path.extname(filename)
      const buffer = await fs.readFile(filePath)
      reply
        .type(ext === '.png' ? 'image/png' : 'image/jpeg')
        .send(buffer)
    } catch (err) {
      reply.notFound('Avatar introuvable')
    }
  })
}

export default avatarRoutes