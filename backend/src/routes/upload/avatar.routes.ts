import { FastifyPluginAsync } from 'fastify'
import path from 'path'
import fs from 'fs/promises'

const avatarRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/uploads/avatar/:filename', {
    schema: {
      tags: ['user'],
      summary: 'Récupérer un avatar',
      description: 'Permet à un utilisateur connecté d’accéder à un avatar (JPEG ou PNG).',
      params: {
        type: 'object',
        properties: {
          filename: {
            type: 'string',
            description: 'Nom du fichier avatar (ex: abc123.jpg)'
          }
        },
        required: ['filename']
      },
      response: {
        200: {
          description: 'Image de l’avatar',
          content: {
            'image/png': { schema: { type: 'string', format: 'binary' } },
            'image/jpeg': { schema: { type: 'string', format: 'binary' } }
          }
        },
        401: {
          description: 'Non authentifié'
        },
        404: {
          description: 'Avatar introuvable'
        }
      },
      security: [{ sessionCookie: [] }]
    }
  }, async (request, reply) => {
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