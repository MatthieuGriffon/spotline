import { FastifyRequest, FastifyReply } from 'fastify'

export async function adminGuard(request: FastifyRequest, reply: FastifyReply) {
  const user = request.session?.user
  if (!user || user.role !== 'ADMIN') {
    return reply.code(403).send({ error: 'Accès réservé aux administrateurs' })
  }
}