import { FastifyRequest, FastifyReply } from 'fastify'
import { getAllUsers, updateUserByAdmin } from '@/services/admin/adminUserService'

export async function getAllUsersHandler(request: FastifyRequest, reply: FastifyReply) {
  const users = await getAllUsers(request.server)
  return users
}

export async function updateUserByAdminHandler(request: FastifyRequest<{
  Params: { id: string },
  Body: { pseudo: string, role: 'USER' | 'ADMIN', isBanned: boolean }
}>, reply: FastifyReply) {
  const updated = await updateUserByAdmin(request.server, request.params.id, request.body)
  return updated
}