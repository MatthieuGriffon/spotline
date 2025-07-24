import { FastifyInstance } from 'fastify'
import { hashPassword } from '@/utils/password'
import { verifyPassword } from '@/utils/password'
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