import { FastifyRequest } from 'fastify'

export function getSessionUser(request: FastifyRequest) {
  const user = request.session.user
  if (!user) {
    throw new Error('Utilisateur non authentifié')
  }
  return user
}