import { FastifyInstance } from 'fastify'
import { register } from '@/controllers/auth.controller'
import { RegisterBody } from '@/schemas/auth.schema'

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', {
    schema: {
      body: RegisterBody,
    },
    handler: register,
  })
}