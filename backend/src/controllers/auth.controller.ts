import { FastifyRequest, FastifyReply } from 'fastify'
import { RegisterBody } from '@/schemas/auth.schema'
import { registerUser } from '@/services/auth.service'

export async function register(request: FastifyRequest<{ Body: typeof RegisterBody['static'] }>, reply: FastifyReply) {
  const { email, password, pseudo } = request.body

  const user = await registerUser(request.server, email, password, pseudo)

  reply.code(200).send({ message: 'Compte créé. Vérifie ta boîte mail ✉️' })
}