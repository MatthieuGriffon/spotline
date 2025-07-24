import { PrismaClient } from '@prisma/client'
import { FastifyRequest } from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
    email: {
      sendConfirmationEmail: (email: string, token: string) => Promise<void>
    }
  }

  interface FastifyRequest {
    session: {
      user?: {
        id: string
        email: string
        pseudo: string
      }
    }
  }
}