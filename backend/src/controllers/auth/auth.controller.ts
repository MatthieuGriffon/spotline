import { FastifyRequest, FastifyReply } from 'fastify'
import { RegisterBody } from '@/schemas/auth/auth.schema'
import { LoginBody } from '@/schemas/auth/login.schema'
import { loginUser } from '@/services/auth/auth.service'
import { registerUser } from '@/services/auth/auth.service'
import { confirmEmailToken } from '@/services/emailConfirmationService'
import { changePassword,confirmPasswordChange } from '@/services/auth/auth.service'
import { ChangePasswordBody } from '@/schemas/auth/changePassword.schema'
import { forgotPassword, resetPassword } from '@/services/auth/auth.service'
import { requestEmailChange } from '@/services/auth/auth.service'
import { createAccountSession } from '@/services/user/user.services'


export async function register(
  request: FastifyRequest<{ Body: typeof RegisterBody['static'] }>,
  reply: FastifyReply
) {
  const { email, password, pseudo } = request.body
  const user = await registerUser(request.server, email, password, pseudo)

  reply.code(200).send({ message: 'Compte créé. Vérifie ta boîte mail' })
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

  reply.send({
  message: 'Email confirmé et connecté',
  user: {
    id: user.id,
    email: user.email,
    pseudo: user.pseudo,
    role: user.role,
  }
})
}

export async function confirmEmailViaQuery(
  request: FastifyRequest<{ Querystring: { token: string } }>,
  reply: FastifyReply
) {
  const { token } = request.query
  const { user } = await confirmEmailToken(request.server, token)

  request.session.user = {
    id: user.id,
    email: user.email,
    pseudo: user.pseudo,
    role: user.role,
    }

  reply.send({
    message: 'Email confirmé et connecté',
    user: {
      id: user.id,
      email: user.email,
      pseudo: user.pseudo,
      role: user.role
    }
  })
}

export async function requestEmailChangeHandler(
  request: FastifyRequest<{ Body: { newEmail: string } }>,
  reply: FastifyReply
) {
  const userId = request.session.user?.id
  if (!userId) return reply.unauthorized('Non authentifié')

  const { newEmail } = request.body
  await requestEmailChange(request.server, userId, newEmail)

  reply.send({ message: 'Un email de confirmation a été envoyé.' })
}

export async function login(
  request: FastifyRequest<{ Body: typeof LoginBody['static'] }>,
  reply: FastifyReply
) {
  const { email, password } = request.body
  const user = await loginUser(request.server, email, password)

  const ip = request.ip
  const userAgent = request.headers['user-agent'] || ''

  const session = await createAccountSession(request.server, user.id, userAgent, ip)
  console.log('session avant assignation:', request.session)

  request.session.user = user
request.session.accountSessionId = session.id

  reply.send({ message: 'Connexion réussie' })
}

export async function logout(request: FastifyRequest, reply: FastifyReply) {
  await request.session.destroy()
  reply.send({ message: 'Déconnecté avec succès' })
}

export async function getMe(request: FastifyRequest, reply: FastifyReply) {
  reply.send(request.session.user)
}

export async function changePasswordHandler(
  request: FastifyRequest<{ Body: typeof ChangePasswordBody['static'] }>,
  reply: FastifyReply
) {
  if (!request.session.user) {
    return reply.unauthorized('Authentification requise')
  }

  const { oldPassword, newPassword } = request.body
  await changePassword(request.server, request.session.user.id, oldPassword, newPassword)

  reply.send({ message: 'Mot de passe modifié avec succès 🔒' })
}

export async function confirmPasswordChangeHandler(
  request: FastifyRequest<{ Body: { token: string } }>,
  reply: FastifyReply
) {
  const { token } = request.body

  const user = await confirmPasswordChange(request.server, token)

  // On peut connecter automatiquement l'utilisateur si on veut
  request.session.user = {
    id: user.id,
    email: user.email,
    pseudo: user.pseudo,
    role: user.role,
  }

  reply.send({ message: 'Mot de passe modifié avec succès 🎉' })
}

export async function forgotPasswordHandler(
  request: FastifyRequest<{ Body: { email: string } }>,
  reply: FastifyReply
) {
  const { email } = request.body
  await forgotPassword(request.server, email)
  reply.send({ message: 'Si ce compte existe, un email a été envoyé.' })
}

export async function resetPasswordHandler(
  request: FastifyRequest<{ Body: { token: string, newPassword: string } }>,
  reply: FastifyReply
) {
  const { token, newPassword } = request.body
  await resetPassword(request.server, token, newPassword)
  reply.send({ message: 'Mot de passe réinitialisé avec succès 🎉' })
}