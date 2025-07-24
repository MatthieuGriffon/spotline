import { FastifyInstance } from 'fastify'
import { hashPassword, verifyPassword } from '@/utils/password'
import { v4 as uuidv4 } from 'uuid'

export async function registerUser(fastify: FastifyInstance, email: string, password: string, pseudo: string) {
  const existing = await fastify.prisma.user.findUnique({ where: { email } })
  if (existing) throw fastify.httpErrors.conflict('Email déjà utilisé')

  const hashedPwd = await hashPassword(password)

  const user = await fastify.prisma.user.create({
    data: {
      email,
      hashedPwd,
      pseudo,
    },
  })

  const token = uuidv4()
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24) // 24h

  await fastify.prisma.emailConfirmationToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: expires,
    },
  })

  await fastify.email.sendConfirmationEmail(email, token)

  return user
}

export async function loginUser(fastify: FastifyInstance, email: string, password: string) {
  const user = await fastify.prisma.user.findUnique({ where: { email } })

  if (!user) throw fastify.httpErrors.unauthorized('Email ou mot de passe invalide')
  if (!user.isConfirmed) throw fastify.httpErrors.unauthorized('Email non confirmé')

  const isValid = await verifyPassword(password, user.hashedPwd)
  if (!isValid) throw fastify.httpErrors.unauthorized('Email ou mot de passe invalide')

  return {
    id: user.id,
    email: user.email,
    pseudo: user.pseudo,
    role: user.role,
    imageUrl: user.imageUrl,
  }
}

export async function changePassword(
  fastify: FastifyInstance,
  userId: string,
  oldPassword: string,
  newPassword: string
) {
  const user = await fastify.prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw fastify.httpErrors.notFound('Utilisateur non trouvé')

  const isValid = await verifyPassword(oldPassword, user.hashedPwd)
  if (!isValid) throw fastify.httpErrors.unauthorized('Ancien mot de passe incorrect')

  const hashedNewPwd = await hashPassword(newPassword)
  const token = uuidv4()
  const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 heure

  // Crée un token de changement en base
  await fastify.prisma.passwordChangeToken.create({
    data: {
      token,
      userId: user.id,
      newHashedPwd: hashedNewPwd,
      expiresAt: expires,
    },
  })

  // Envoi mail avec lien de confirmation
  const resetLink = `${process.env.FRONTEND_URL}/confirm-password-change/${token}`

  await fastify.email.sendConfirmationEmail(
    user.email,
    token,
    
    'Confirmez votre changement de mot de passe',
    `Cliquez sur ce lien pour valider votre nouveau mot de passe : ${resetLink}`
  )

  return true
}