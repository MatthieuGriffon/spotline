import { FastifyInstance } from 'fastify'
import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { randomUUID } from 'crypto'

export async function deleteUserById(fastify: FastifyInstance, userId: string) {
  const user = await fastify.prisma.user.findUnique({ where: { id: userId } })
  if (!user) return

  // Supprimer l’avatar du disque si présent
  if (user.imageUrl) {
    const avatarPath = path.join('uploads/avatars', path.basename(user.imageUrl))
    try {
      await fs.unlink(avatarPath)
    } catch (err) {
      fastify.log.warn(`Erreur suppression avatar : ${err}`)
    }
  }

  // Facultatif : anonymiser ou supprimer les prises/sessions liées
  await fastify.prisma.prise.deleteMany({ where: { userId } })
  await fastify.prisma.session.deleteMany({ where: { organizerId: userId } })
  await fastify.prisma.sessionInvite.deleteMany({ where: { userId } })
  await fastify.prisma.emailConfirmationToken.deleteMany({ where: { userId } })

  // Supprimer le compte
  await fastify.prisma.user.delete({ where: { id: userId } })
}

export async function updateUserPseudo(
  fastify: FastifyInstance,
  userId: string,
  newPseudo: string
) {
  return fastify.prisma.user.update({
    where: { id: userId },
    data: { pseudo: newPseudo }
  })
}

export async function updateUserAvatar(
  fastify: FastifyInstance,
  userId: string,
  file: any
) {
  // Vérification du type MIME
  if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
    throw fastify.httpErrors.badRequest('Format d’image non supporté')
  }

  // Taille max 5 Mo
  if (file.file.bytesRead > 5 * 1024 * 1024) {
    throw fastify.httpErrors.badRequest('Fichier trop volumineux')
  }

  // Créer nom de fichier
  const ext = file.filename.split('.').pop()
  const filename = `${randomUUID()}.${ext}`
  const filepath = path.join('uploads/avatars', filename)

  // Création du dossier si pas existant
  await fs.mkdir(path.dirname(filepath), { recursive: true })

  // Redimensionner et enregistrer avec sharp
  const buffer = await file.toBuffer()
  await sharp(buffer).resize({ width: 1920 }).toFile(filepath)

  // Supprimer l’ancien avatar
  const user = await fastify.prisma.user.findUnique({ where: { id: userId } })
  if (user?.imageUrl) {
    const oldPath = path.join('uploads/avatars', path.basename(user.imageUrl))
    await fs.unlink(oldPath).catch(() => {}) // on ignore si inexistant
  }

  // Update BDD
  const newUrl = `/uploads/avatars/${filename}`
  await fastify.prisma.user.update({
    where: { id: userId },
    data: { imageUrl: newUrl }
  })

  return newUrl
}

export async function createAccountSession(
  fastify: FastifyInstance,
  userId: string,
  userAgent?: string,
  ip?: string
) {
  return fastify.prisma.accountSession.create({
    data: {
      userId,
      userAgent,
      ip
    }
  })
}

export async function getUserSessions(fastify: FastifyInstance, userId: string) {
  return fastify.prisma.accountSession.findMany({
    where: { userId },
    select: {
      id: true,
      createdAt: true,
      lastSeen: true,
      userAgent: true,
      ip: true
    },
    orderBy: { lastSeen: 'desc' }
  })
}

export async function deleteUserSession(fastify: FastifyInstance, userId: string, sessionId: string) {
  return fastify.prisma.accountSession.deleteMany({
    where: {
      id: sessionId,
      userId
    }
  })
}

export async function deleteOtherSessions(fastify: FastifyInstance, userId: string, currentSessionId: string) {
  return fastify.prisma.accountSession.deleteMany({
    where: {
      userId,
      NOT: { id: currentSessionId }
    }
  })
}

export async function getUserPreferences(fastify: FastifyInstance, userId: string) {
  return fastify.prisma.userPreferences.findUnique({
    where: { userId }
  })
}

export async function updateUserPreferences(
  fastify: FastifyInstance,
  userId: string,
  prefs: Partial<{ darkMode: boolean, mapTile: string, notifications: boolean }>
) {
  return fastify.prisma.userPreferences.upsert({
    where: { userId },
    create: {
      userId,
      darkMode: prefs.darkMode ?? false,
      mapTile: prefs.mapTile ?? 'default',
      notifications: prefs.notifications ?? true
    },
    update: prefs
  })
}