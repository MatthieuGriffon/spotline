import { FastifyPluginAsync } from 'fastify'
import {
  deleteOwnAccount,
  deleteUserByAdmin,
  changePseudo,
  uploadAvatar
} from '@/controllers/user/user.controller'
import {
  getUserSettingsHandler,
  updateUserSettingsHandler
} from '@/controllers/user/userSetting.controller'

import { DeleteUserParams } from '@/schemas/user/deleteUser.schema'
import { UpdatePseudoBody } from '@/schemas/user/updatePseudo.schema'
import {
  UserSettingsBody,
  UserSettingsResponse
} from '@/schemas/user/userSettings.schema'

import { requireAuth } from '@/middlewares/requireAuth'
import { adminGuard } from '@/middlewares/adminGuard'

const userRoutes: FastifyPluginAsync = async (fastify) => {
  // Supprimer son propre compte
  fastify.delete('/user', {
    preHandler: [requireAuth],
    schema: {
      tags: ['user'],
      summary: 'Supprimer son compte',
      description: 'Supprime définitivement le compte de l’utilisateur connecté.',
      response: {
        204: {
          description: 'Compte supprimé avec succès'
        }
      },
      security: [{ sessionCookie: [] }]
    }
  }, deleteOwnAccount)

  // Supprimer un utilisateur (admin)
  fastify.delete('/user/:id', {
    preHandler: [requireAuth, adminGuard],
    schema: {
      tags: ['admin'],
      summary: 'Supprimer un utilisateur',
      description: 'Permet à un admin de supprimer un utilisateur donné.',
      params: DeleteUserParams,
      response: {
        204: {
          description: 'Utilisateur supprimé avec succès'
        },
        403: { description: 'Non autorisé' }
      },
      security: [{ sessionCookie: [] }]
    }
  }, deleteUserByAdmin)

  // Modifier son pseudo
  fastify.put('/user/pseudo', {
    preHandler: [requireAuth],
    schema: {
      tags: ['user'],
      summary: 'Modifier le pseudo',
      description: 'Change le pseudo de l’utilisateur connecté.',
      body: UpdatePseudoBody,
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      },
      security: [{ sessionCookie: [] }]
    }
  }, changePseudo)

  // Upload avatar
  fastify.post('/user/avatar', {
    preHandler: [requireAuth],
    schema: {
      tags: ['user'],
      summary: 'Envoyer un avatar',
      description: 'Upload un avatar pour l’utilisateur connecté (image PNG ou JPEG).',
      consumes: ['multipart/form-data'],
      response: {
        200: {
          type: 'string',
          description: 'URL de l’avatar'
        }
      },
      security: [{ sessionCookie: [] }]
    }
  }, uploadAvatar)

  // Récupérer ses préférences
  fastify.get('/user/settings', {
    preHandler: [requireAuth],
    schema: {
      tags: ['user'],
      summary: 'Voir ses préférences',
      description: 'Renvoie les paramètres utilisateur stockés.',
      response: {
        200: UserSettingsResponse
      },
      security: [{ sessionCookie: [] }]
    }
  }, getUserSettingsHandler)

  // Mettre à jour ses préférences
  fastify.put('/user/settings', {
    preHandler: [requireAuth],
    schema: {
      body: UserSettingsBody,
      response: {
        200: UserSettingsResponse
      },
      tags: ['user'],
      summary: 'Mettre à jour les préférences utilisateur',
      description: 'Met à jour les préférences liées au thème, aux tuiles cartographiques et aux notifications.',
      security: [{ sessionCookie: [] }]
    },
    handler: updateUserSettingsHandler
  })
}

export default userRoutes