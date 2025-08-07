import { FastifyRequest, FastifyReply } from 'fastify'

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  if (!request.session.user) {
    return reply.unauthorized('Tu dois être connecté pour accéder à cette ressource.'
    )
  }
}