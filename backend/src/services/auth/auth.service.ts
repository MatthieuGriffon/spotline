import { FastifyInstance } from 'fastify'
import { hashPassword, verifyPassword } from '@/utils/password'
import { v4 as uuidv4 } from 'uuid'
import { randomUUID } from 'crypto'
import { sanitizePseudo } from '@/utils/sanitize'

export async function registerUser(
  fastify: FastifyInstance,
  email: string,
  password: string,
  pseudo: string
) {
  const existing = await fastify.prisma.user.findUnique({ where: { email } })
  if (existing) throw fastify.httpErrors.conflict('Email déjà utilisé')

  const safePseudo = sanitizePseudo(pseudo)
  const hashedPwd = await hashPassword(password)

  const user = await fastify.prisma.user.create({
    data: {
      email,
      hashedPwd,
      pseudo: safePseudo,
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

  await fastify.email.sendMail({
    to: email,
    subject: 'Confirmation de ton compte Spotline',
    html: `
      <h2>Bienvenue sur Spotline !</h2>
      <p>Pour confirmer ton compte, clique ici :</p>
      <p>
        <a href="${process.env.FRONTEND_URL}/?token=${token}">Confirmer mon compte</a>
      </p>
    `,
  })

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
    isConfirmed: user.isConfirmed,
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

 await fastify.email.sendMail({
  to: user.email,
  subject: 'Confirme le changement de ton mot de passe Spotline',
  html: `
    <h2>Sécurité de ton compte Spotline</h2>
    <p>Pour valider ton nouveau mot de passe, clique sur ce lien :</p>
    <p>
      <a href="${resetLink}">Valider mon nouveau mot de passe</a>
    </p>
    <p>Ce lien est valable 1 heure.</p>
  `,
}) 

  return true
}

export async function confirmPasswordChange(fastify: FastifyInstance, token: string) {
  const record = await fastify.prisma.passwordChangeToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!record) {
    throw fastify.httpErrors.notFound('Token invalide ou expiré')
  }

  if (record.expiresAt < new Date()) {
    await fastify.prisma.passwordChangeToken.delete({ where: { token } })
    throw fastify.httpErrors.badRequest('Token expiré')
  }

  await fastify.prisma.$transaction([
    fastify.prisma.user.update({
      where: { id: record.userId },
      data: { hashedPwd: record.newHashedPwd },
    }),
    fastify.prisma.passwordChangeToken.delete({
      where: { token },
    }),
  ])

  return {
    id: record.user.id,
    email: record.user.email,
    pseudo: record.user.pseudo,
    role: record.user.role,
    imageUrl: record.user.imageUrl,
  }
}

export async function forgotPassword(fastify: FastifyInstance, email: string) {
  const user = await fastify.prisma.user.findUnique({ where: { email } })
  if (!user) return // Ne rien dire pour éviter l'enum brute-force

  const token = uuidv4()
  const expires = new Date(Date.now() + 1000 * 60 * 60) // 1h

  await fastify.prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: expires,
    },
  })

  await fastify.email.sendMail({
    to: email,
    subject: 'Réinitialise ton mot de passe Spotline',
    html: `
      <h2>Réinitialisation de ton mot de passe Spotline</h2>
      <p>Pour choisir un nouveau mot de passe, clique sur ce lien :</p>
      <p>
        <a href="${process.env.FRONTEND_URL}/reset-password/${token}">Réinitialiser mon mot de passe</a>
      </p>
      <p>Ce lien est valable 1 heure.</p>
    `,
  })
}

export async function resetPassword(fastify : FastifyInstance, token: string, newPassword: string) {
  const record = await fastify.prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!record) throw fastify.httpErrors.notFound('Token invalide ou expiré')
  if (record.expiresAt < new Date()) {
    await fastify.prisma.passwordResetToken.delete({ where: { token } })
    throw fastify.httpErrors.badRequest('Token expiré')
  }

  const hashedPwd = await hashPassword(newPassword)

  await fastify.prisma.$transaction([
    fastify.prisma.user.update({
      where: { id: record.userId },
      data: { hashedPwd },
    }),
    fastify.prisma.passwordResetToken.delete({
      where: { token },
    }),
  ])
  return true
}
// services/auth/auth.service.ts
export async function requestEmailChange(fastify: FastifyInstance, userId: string, newEmail: string) {
  const existing = await fastify.prisma.user.findUnique({ where: { email: newEmail } })
  if (existing) throw fastify.httpErrors.conflict('Cet email est déjà utilisé.')

  await fastify.prisma.user.update({ where: { id: userId }, data: { pendingEmail: newEmail } })

  const token = randomUUID()
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24)

  await fastify.prisma.emailConfirmationToken.create({ data: { token, userId, expiresAt } })
   const frontBase = process.env.PUBLIC_FRONTEND_URL ?? 'http://localhost:5173'
   const confirmUrl = `${frontBase}/auth/confirm?token=${token}`
  await fastify.email.sendMail({
    to: newEmail,
    subject: 'Confirme ton nouveau mail Spotline',
    html: `
      <p>Tu as demandé à changer ton adresse email.</p>
      <p>Clique ici pour confirmer :</p>
      <a href="${confirmUrl}">${confirmUrl}</a>
      <p>Ce lien est valable 24h.</p>
    `
  })
}
