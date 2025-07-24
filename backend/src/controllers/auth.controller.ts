import { FastifyRequest, FastifyReply } from 'fastify'
import { RegisterBody } from '@/schemas/auth.schema'
import { LoginBody } from '@/schemas/auth/login.schema'
import { loginUser } from '@/services/auth.service'
import { registerUser } from '@/services/auth.service'
import { confirmEmailToken } from '@/services/emailConfirmationService'

export async function register(
  request: FastifyRequest<{ Body: typeof RegisterBody['static'] }>,
  reply: FastifyReply
) {
  const { email, password, pseudo } = request.body
  const user = await registerUser(request.server, email, password, pseudo)

  reply.code(200).send({ message: 'Compte créé. Vérifie ta boîte mail ✉️' })
}

export async function confirmEmailHandler(
  request: FastifyRequest<{ Params: { token: string } }>,
  reply: FastifyReply
) {
  const { token } = request.params
  const { user } = await confirmEmailToken(request.server, token)

  request.session.user = {
    id: user.id,
    email: user.email,
    pseudo: user.pseudo,
    role: user.role,
  }

  reply.send({ message: 'Email confirmé et connecté 🎉' })
}

export async function login(
  request: FastifyRequest<{ Body: typeof LoginBody['static'] }>,
  reply: FastifyReply
) {
  const { email, password } = request.body
  const user = await loginUser(request.server, email, password)

  request.session.user = user

  reply.send({ message: 'Connexion réussie 🐟' })
}

export async function getMe(request: FastifyRequest, reply: FastifyReply) {
  reply.send(request.session.user)
}