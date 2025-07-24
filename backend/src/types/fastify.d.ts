import { PrismaClient } from '@prisma/client'
import { FastifyRequest } from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
    email: {
      sendMail: (params: {
        to: string
        subject: string
        html: string
      }) => Promise<void>
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