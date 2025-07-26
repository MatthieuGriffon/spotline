import { FastifyInstance } from 'fastify'
import {
  getAccountSessionsHandler,
  deleteAccountSessionHandler,
  deleteAllAccountSessionsExceptCurrentHandler
} from '@/controllers/user/accountSession.controller'
import { requireAuth } from '@/middlewares/requireAuth'

export async function accountSessionRoutes(fastify: FastifyInstance) {
  // Lister toutes les sessions actives
  fastify.get('/user/sessions', {
    preHandler: requireAuth,
    schema: {
      tags: ['user'],
      summary: 'Lister les sessions actives',
      description: 'Renvoie toutes les sessions actives de l’utilisateur connecté.',
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              lastSeen: { type: 'string', format: 'date-time' },
              userAgent: { type: 'string' },
              ip: { type: 'string' }
            }
          }
        }
      },
      security: [{ sessionCookie: [] }]
    }
  }, getAccountSessionsHandler)

  // Supprimer une session spécifique
  fastify.delete<{
    Params: { id: string }
  }>('/user/sessions/:id', {
    preHandler: requireAuth,
    schema: {
      tags: ['user'],
      summary: 'Supprimer une session',
      description: 'Supprime une session spécifique (autre que celle en cours).',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID de la session à supprimer' }
        },
        required: ['id']
      },
      response: {
        204: {
          description: 'Session supprimée avec succès'
        },
        400: {
          description: 'Tentative de suppression de la session courante'
        }
      },
      security: [{ sessionCookie: [] }]
    }
  }, deleteAccountSessionHandler)

  // Supprimer toutes les sessions sauf celle en cours
  fastify.delete('/user/sessions', {
    preHandler: requireAuth,
    schema: {
      tags: ['user'],
      summary: 'Déconnexion globale',
      description: 'Supprime toutes les sessions sauf la session active actuelle.',
      response: {
        204: {
          description: 'Autres sessions supprimées avec succès'
        },
        400: {
          description: 'Aucune session active trouvée'
        }
      },
      security: [{ sessionCookie: [] }]
    }
  }, deleteAllAccountSessionsExceptCurrentHandler)
}