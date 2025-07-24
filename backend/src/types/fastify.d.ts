import { PrismaClient } from '@prisma/client'
import { FastifyRequest } from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
    email: {
      sendConfirmationEmail: (email: string, token: string) => Promise<void>
    }
  }
  interface Session {
    user?: {
      id: string
      email: string
      pseudo: string
      role: 'USER' | 'ADMIN'
    }
  }
}