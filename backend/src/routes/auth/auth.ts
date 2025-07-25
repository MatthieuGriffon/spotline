// Libs externes
import { FastifyInstance } from 'fastify'
import { Type } from '@sinclair/typebox'
// Middlewares
import { requireAuth } from '@/middlewares/requireAuth'
// Controllers
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
// Schemas
import { RegisterBody } from '@/schemas/auth/auth.schema'
import { confirmParamsSchema } from '@/schemas/auth/confirm'
import { LoginBody } from '@/schemas/auth/login.schema'
import { meRouteSchema } from '@/schemas/auth/meRouteSchema'
import { logoutRouteSchema } from '@/schemas/auth/logoutRouteSchema'
import { ChangePasswordBody } from '@/schemas/auth/changePassword.schema'
import { ChangeEmailBody } from '@/schemas/auth/changeEmail.schema'

export default async function authRoutes(fastify: FastifyInstance) {
  
  fastify.get('/confirm/:token', {
    schema: {
      params: confirmParamsSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    handler: confirmEmailHandler,
  })

  fastify.get('/me', {
  preHandler: requireAuth,
  schema: meRouteSchema,
  handler: getMe,
  })

  fastify.post('/register', {
    schema: {
      body: RegisterBody,
    },
    handler: register,
  })

  fastify.post('/login', {
  schema: {
    body: LoginBody,
    response: {
      200: Type.Object({
        message: Type.String(),
      }),
    },
  },
  handler: login,
  })

  fastify.post('/logout', {
  preHandler: requireAuth,
  schema: logoutRouteSchema,
  handler: logout,
  })

fastify.put('/password', {
  preHandler: requireAuth,
  schema: {
    body: ChangePasswordBody,
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  handler: changePasswordHandler,
  })

  fastify.put('/change-email', {
  preHandler: requireAuth,
  schema: {
    body: ChangeEmailBody,
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  handler: requestEmailChangeHandler,
})

fastify.post('/confirm-password-change', {
  schema: {
    body: Type.Object({
      token: Type.String(),
    }),
    response: {
      200: Type.Object({
        message: Type.String(),
      }),
    },
  },
  handler: confirmPasswordChangeHandler,
  })

fastify.post('/forgot-password', {
  schema: {
    body: Type.Object({ email: Type.String({ format: 'email' }) }),
    response: { 200: Type.Object({ message: Type.String() }) }
  },
  handler: forgotPasswordHandler,
})

fastify.post('/reset-password', {
  schema: {
    body: Type.Object({ token: Type.String(), newPassword: Type.String() }),
    response: { 200: Type.Object({ message: Type.String() }) }
  },
  handler: resetPasswordHandler,
})
}