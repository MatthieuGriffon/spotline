import type { FastifyInstance } from "fastify";
import {
  assertAdmin,
  assertMember,
  getMembership,
  isGroupAdmin,
} from "@/services/access/groupAccess.service";

export async function createGroup(
  fastify: FastifyInstance,
  userId: string,
  data: { name: string; description?: string }
) {
  return fastify.prisma.$transaction(async (tx) => {
    const group = await tx.group.create({
      data: { name: data.name, description: data.description ?? null, creatorId: userId },
    });
    // créateur admin
    await tx.groupMember.create({
      data: { groupId: group.id, userId, role: "admin" },
    });
    return group;
  });
}

export async function getGroup(
  fastify: FastifyInstance,
  userId: string,
  groupId: string
) {
  await assertMember(fastify, groupId, userId);
  return fastify.prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: { select: { userId: true, role: true, joinedAt: true } },
      sessions: true,
      prises: true,
    },
  });
}

export async function updateGroup(
  fastify: FastifyInstance,
  userId: string,
  groupId: string,
  data: { name?: string; description?: string }
) {
  await assertAdmin(fastify, groupId, userId);
  return fastify.prisma.group.update({
    where: { id: groupId },
    data: { ...data },
  });
}

export async function inviteUser(
  fastify: FastifyInstance,
  userId: string,
  groupId: string,
  payload: { userId: string; role?: "admin" | "member" | "guest" }
) {
  await assertAdmin(fastify, groupId, userId);
  const role = payload.role ?? "member";
  // Si déjà membre → 409
  const exists = await fastify.prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: payload.userId, groupId } },
  });
  if (exists) throw fastify.httpErrors.conflict("Utilisateur déjà membre");
  return fastify.prisma.groupMember.create({
    data: { userId: payload.userId, groupId, role },
  });
}

export async function changeRole(
  fastify: FastifyInstance,
  userId: string,
  groupId: string,
  targetUserId: string,
  role: "admin" | "member" | "guest"
) {
  await assertAdmin(fastify, groupId, userId);

  // Interdits : se retirer le dernier admin, ou retirer admin au dernier admin
  const admins = await fastify.prisma.groupMember.count({
    where: { groupId, role: "admin" },
  });
  const target = await fastify.prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: targetUserId, groupId } },
  });
  if (!target) throw fastify.httpErrors.notFound("Membre introuvable");

  // si on rétrograde un admin et qu'il est le dernier → interdit
  if (target.role === "admin" && role !== "admin" && admins <= 1) {
    throw fastify.httpErrors.badRequest(
      "Impossible de rétrograder le dernier admin"
    );
  }

  return fastify.prisma.groupMember.update({
    where: { userId_groupId: { userId: targetUserId, groupId } },
    data: { role },
  });
}

export async function removeMember(
  fastify: FastifyInstance,
  actorId: string,
  groupId: string,
  targetUserId: string
) {
  await assertAdmin(fastify, groupId, actorId);

  const target = await fastify.prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: targetUserId, groupId } },
  });
  if (!target) throw fastify.httpErrors.notFound("Membre introuvable");

  // On ne peut pas exclure le dernier admin
  const admins = await fastify.prisma.groupMember.count({
    where: { groupId, role: "admin" },
  });
  if (target.role === "admin" && admins <= 1)
    throw fastify.httpErrors.badRequest(
      "Impossible de retirer le dernier admin"
    );

  return fastify.prisma.groupMember.delete({
    where: { userId_groupId: { userId: targetUserId, groupId } },
  });
}

export async function leaveGroup(
  fastify: FastifyInstance,
  userId: string,
  groupId: string
) {
  const me = await getMembership(fastify, groupId, userId);
  if (!me) throw fastify.httpErrors.forbidden("Non membre");

  // Règle : un admin peut quitter sauf si dernier admin
  if (me.role === "admin") {
    const admins = await fastify.prisma.groupMember.count({
      where: { groupId, role: "admin" },
    });
    if (admins <= 1)
      throw fastify.httpErrors.badRequest(
        "Le dernier admin ne peut pas quitter"
      );
  }

  return fastify.prisma.groupMember.delete({
    where: { userId_groupId: { userId, groupId } },
  });
}

export async function deleteGroup(
  fastify: FastifyInstance,
  userId: string,
  groupId: string
) {
  await assertAdmin(fastify, groupId, userId);
  const creator = await fastify.prisma.groupMember.findFirst({
    where: { groupId, role: "admin" },
    orderBy: { joinedAt: "asc" },
  });
  if (!creator || creator.userId !== userId)
    throw fastify.httpErrors.forbidden(
      "Seul le créateur peut supprimer le groupe"
    );

  return fastify.prisma.$transaction(async (tx) => {
    await tx.groupMember.deleteMany({ where: { groupId } });
    await tx.session.deleteMany({ where: { groupId } });
    await tx.priseGroup.deleteMany({ where: { groupId } }); // ✅ Correction
    return tx.group.delete({ where: { id: groupId } });
  });
}

export async function getMyGroups(fastify: FastifyInstance, userId: string) {
  const groups = await fastify.prisma.group.findMany({
    where: { members: { some: { userId } } },
    include: {
      members: { select: { userId: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return groups.map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    createdAt: g.createdAt.toISOString(),
    memberCount: g.members.length, // ✅ calculé ici
    role: g.members.find((m) => m.userId === userId)?.role || "member",
  }));
}
