import { FastifyInstance } from 'fastify'

export async function getAllUsers(fastify: FastifyInstance) {
  return fastify.prisma.user.findMany({
    select: {
      id: true,
      pseudo: true,
      email: true,
      role: true,
      isBanned: true,
      isConfirmed: true
    }
  })
}

export async function updateUserByAdmin(
  fastify: FastifyInstance,
  id: string,
  data: { pseudo: string; role: 'USER' | 'ADMIN'; isBanned: boolean }
) {
  return fastify.prisma.user.update({
    where: { id },
    data
  })
}