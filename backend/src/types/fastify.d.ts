import { PrismaClient } from '@prisma/client'
import { FastifyRequest } from 'fastify'
import '@fastify/session'
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
     accountSessionId?: string
  }
  export interface SessionUser {
  id: string
  pseudo: string
  role: 'USER' | 'ADMIN'
}
  interface SessionData {
    user?: {
      id: string
      email: string
      pseudo: string
      role: 'USER' | 'ADMIN'
    }
    accountSessionId?: string
  }
  
}