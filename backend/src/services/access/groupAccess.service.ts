import type { FastifyInstance } from "fastify";

export async function isGroupMember(
  fastify: FastifyInstance,
  groupId: string,
  userId: string
) {
  const gm = await fastify.prisma.groupMember.findUnique({
    where: { userId_groupId: { userId, groupId } },
  });
  return !!gm;
}

export async function getMembership(
  fastify: FastifyInstance,
  groupId: string,
  userId: string
) {
  return fastify.prisma.groupMember.findUnique({
    where: { userId_groupId: { userId, groupId } },
  });
}

export async function isGroupAdmin(
  fastify: FastifyInstance,
  groupId: string,
  userId: string
) {
  const gm = await getMembership(fastify, groupId, userId);
  return gm?.role === "admin";
}

export async function assertMember(
  fastify: FastifyInstance,
  groupId: string,
  userId: string
) {
  if (!(await isGroupMember(fastify, groupId, userId)))
    throw fastify.httpErrors.forbidden("Accès groupe refusé");
}

export async function assertAdmin(
  fastify: FastifyInstance,
  groupId: string,
  userId: string
) {
  if (!(await isGroupAdmin(fastify, groupId, userId)))
    throw fastify.httpErrors.forbidden("Admin requis");
}
