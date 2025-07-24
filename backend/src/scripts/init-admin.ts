import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

export async function initAdmin(prisma: PrismaClient) {
  const existing = await prisma.user.findFirst({ where: { role: 'ADMIN' } })

  if (existing) {
    console.log('✅ Admin déjà existant :', existing.email)
    return
  }

  const hashedPwd = await bcrypt.hash('admin1234', 10)

  const admin = await prisma.user.create({
    data: {
      email: 'admin@spotline.app',
      pseudo: 'SuperAdmin',
      hashedPwd,
      isConfirmed: true,
      role: 'ADMIN',
    },
  })

  console.log('✨ Admin créé avec succès :', admin.email)
}
