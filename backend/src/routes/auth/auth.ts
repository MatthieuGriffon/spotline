import { FastifyInstance } from 'fastify'
import { Type } from '@sinclair/typebox'
import { requireAuth } from '@/middlewares/requireAuth'

import {
  register,
  confirmEmailHandler,
  login,
  getMe,
  logout,
  changePasswordHandler,
  confirmPasswordChangeHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  requestEmailChangeHandler
} from '@/controllers/auth/auth.controller'

import { RegisterBody } from '@/schemas/auth/auth.schema'
import { confirmParamsSchema } from '@/schemas/auth/confirm'
import { LoginBody } from '@/schemas/auth/login.schema'
import { meRouteSchema } from '@/schemas/auth/meRouteSchema'
import { logoutRouteSchema } from '@/schemas/auth/logoutRouteSchema'
import { ChangePasswordBody } from '@/schemas/auth/changePassword.schema'
import { ChangeEmailBody } from '@/schemas/auth/changeEmail.schema'
import { confirmEmailToken } from '@/services/emailConfirmationService'
import { confirmEmailViaQuery } from '@/controllers/auth/auth.controller'


export default async function authRoutes(fastify: FastifyInstance) {

  fastify.get('/confirm/:token', {
    schema: {
      tags: ['auth'],
      summary: 'Confirmer l’adresse email',
      params: confirmParamsSchema,
      response: {
        200: Type.Object({ message: Type.String() })
      }
    },
    handler: confirmEmailHandler
  })

  fastify.get('/confirm', {
  schema: {
    tags: ['auth'],
    summary: 'Confirmer l’adresse email via query',
    querystring: Type.Object({
      token: Type.String({ minLength: 10 })
    }),
    response: {
      200: Type.Object({
        message: Type.String(),
        user: Type.Object({
          id: Type.String(),
          email: Type.String(),
          pseudo: Type.String(),
          role: Type.String()
        })
      })
    }
  },
  handler: confirmEmailViaQuery
})

  fastify.get('/me', {
    preHandler: requireAuth,
    schema: {
      ...meRouteSchema,
      tags: ['auth'],
      summary: 'Infos de l’utilisateur connecté'
    },
    handler: getMe
  })

  fastify.post('/register', {
    schema: {
      tags: ['auth'],
      summary: 'Créer un compte',
      body: RegisterBody
    },
    handler: register
  })

  fastify.post('/login', {
    schema: {
      tags: ['auth'],
      summary: 'Connexion',
      body: LoginBody,
      response: {
        200: Type.Object({ message: Type.String() })
      }
    },
    handler: login
  })

  fastify.post('/logout', {
    preHandler: requireAuth,
    schema: {
      ...logoutRouteSchema,
      tags: ['auth'],
      summary: 'Déconnexion'
    },
    handler: logout
  })

  fastify.put('/password', {
    preHandler: requireAuth,
    schema: {
      tags: ['auth'],
      summary: 'Changer son mot de passe',
      body: ChangePasswordBody,
      response: {
        200: Type.Object({ message: Type.String() })
      }
    },
    handler: changePasswordHandler
  })

  fastify.put('/change-email', {
    preHandler: requireAuth,
    schema: {
      tags: ['auth'],
      summary: 'Demander un changement d’email',
      body: ChangeEmailBody,
      response: {
        200: Type.Object({ message: Type.String() })
      }
    },
    handler: requestEmailChangeHandler
  })

  fastify.post('/confirm-password-change', {
    schema: {
      tags: ['auth'],
      summary: 'Confirmer un changement de mot de passe',
      body: Type.Object({ token: Type.String() }),
      response: {
        200: Type.Object({ message: Type.String() })
      }
    },
    handler: confirmPasswordChangeHandler
  })

  fastify.post('/forgot-password', {
    schema: {
      tags: ['auth'],
      summary: 'Demander une réinitialisation du mot de passe',
      body: Type.Object({ email: Type.String({ format: 'email' }) }),
      response: {
        200: Type.Object({ message: Type.String() })
      }
    },
    handler: forgotPasswordHandler
  })

  fastify.post('/reset-password', {
    schema: {
      tags: ['auth'],
      summary: 'Réinitialiser le mot de passe avec un token',
      body: Type.Object({
        token: Type.String(),
        newPassword: Type.String()
      }),
      response: {
        200: Type.Object({ message: Type.String() })
      }
    },
    handler: resetPasswordHandler
  })
}
