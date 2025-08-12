import { Prisma } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import {
  assertAdmin,
  assertMember,
  getMembership,
} from "@/services/access/groupAccess.service";

// ─────────────────────────────────────────────────────────────
// Sélecteurs typés pour fiabiliser l’inférence Prisma

const groupWithMembersInclude = Prisma.validator<Prisma.GroupInclude>()({
  members: {
    select: {
      userId: true,
      role: true,
      joinedAt: true,
      user: { select: { pseudo: true } },
    },
  },
});
type GroupWithMembers = Prisma.GroupGetPayload<{
  include: typeof groupWithMembersInclude;
}>;

const groupWithAllInclude = Prisma.validator<Prisma.GroupInclude>()({
  members: {
    select: {
      userId: true,
      role: true,
      joinedAt: true,
      user: { select: { pseudo: true } },
    },
  },
  sessions: {
    select: {
      id: true,
      title: true,
      description: true,
      date: true,
      latitude: true,
      longitude: true,
      groupId: true,
      organizerId: true,
      createdAt: true,
    },
    orderBy: { date: "desc" },
  },

  // ⬇️ ICI on corrige : `prises` est une relation vers PriseGroup (join table)
  // si ta relation s'appelle `priseGroup`, remplace "prises" par "priseGroup"
  prises: {
    select: {
      groupId: true, // champ de PriseGroup
      prise: {
        // relation vers Prise
        select: {
          id: true,
          userId: true,
          photoUrl: true,
          espece: true,
          materiel: true,
          date: true,
          latitude: true,
          longitude: true,
          visibility: true,
          createdAt: true,
        },
      },
    },
    orderBy: { prise: { date: "desc" } }, // ⬅️ tri sur la date de Prise
  },
});
type GroupWithAll = Prisma.GroupGetPayload<{
  include: typeof groupWithAllInclude;
}>;

// ─────────────────────────────────────────────────────────────
// Services

export async function createGroup(
  fastify: FastifyInstance,
  userId: string,
  data: { name: string; description?: string }
) {
  return fastify.prisma.$transaction(async (tx) => {
    // 1) Créer le groupe
    const group = await tx.group.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        creatorId: userId,
      },
    });

    // 2) Le créateur devient admin
    await tx.groupMember.create({
      data: { groupId: group.id, userId, role: "admin" },
    });

    // 3) Recharger le groupe avec les membres (pseudo via relation user)
    const created: GroupWithMembers = await tx.group.findUniqueOrThrow({
      where: { id: group.id },
      include: groupWithMembersInclude,
    });

    // 4) Mapper pour coller au GroupDetailResponse
    return {
      id: created.id,
      name: created.name,
      description: created.description,
      createdAt: created.createdAt.toISOString(),
      creatorId: created.creatorId,
      members: created.members.map((m) => ({
        userId: m.userId,
        pseudo: m.user.pseudo,
        role: m.role,
        joinedAt: m.joinedAt.toISOString(),
      })),
      // requis par le schéma détail
      sessions: [],
      prises: [],
    };
  });
}

export async function getGroup(
  fastify: FastifyInstance,
  userId: string,
  groupId: string
) {
  await assertMember(fastify, groupId, userId);

  const group: GroupWithAll = await fastify.prisma.group.findUniqueOrThrow({
    where: { id: groupId },
    include: groupWithAllInclude,
  });

  return {
    id: group.id,
    name: group.name,
    description: group.description,
    createdAt: group.createdAt.toISOString(),
    creatorId: group.creatorId,
    members: group.members.map((m) => ({
      userId: m.userId,
      pseudo: m.user.pseudo,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
    })),
    sessions: group.sessions.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description ?? null,
      date: s.date.toISOString(),
      latitude: s.latitude,
      longitude: s.longitude,
      groupId: s.groupId,
      organizerId: s.organizerId,
      createdAt: s.createdAt.toISOString(),
    })),

    // 🔧 Aplatir les PriseGroup -> PriseSummary attendu par ton schéma
    prises: group.prises.map((pg) => ({
      id: pg.prise.id,
      userId: pg.prise.userId,
      groupId: pg.groupId, // groupId pris depuis la join table
      photoUrl: pg.prise.photoUrl,
      espece: pg.prise.espece,
      materiel: pg.prise.materiel ?? null,
      date: pg.prise.date.toISOString(),
      latitude: pg.prise.latitude,
      longitude: pg.prise.longitude,
      visibility: pg.prise.visibility,
      createdAt: pg.prise.createdAt.toISOString(),
    })),
  };
}


export async function updateGroup(
  fastify: FastifyInstance,
  userId: string,
  groupId: string,
  data: { name?: string; description?: string }
) {
  await assertAdmin(fastify, groupId, userId);

  // On met à jour
  await fastify.prisma.group.update({
    where: { id: groupId },
    data: { ...data },
  });

  // Puis on renvoie le *détail* complet attendu par le schéma
  const group = await fastify.prisma.group.findUniqueOrThrow({
    where: { id: groupId },
    include: groupWithAllInclude, // le même include que dans getGroup
  });

  return {
    id: group.id,
    name: group.name,
    description: group.description,
    createdAt: group.createdAt.toISOString(),
    creatorId: group.creatorId,
    members: group.members.map((m) => ({
      userId: m.userId,
      pseudo: m.user.pseudo,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
    })),
    sessions: group.sessions.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description ?? null,
      date: s.date.toISOString(),
      latitude: s.latitude,
      longitude: s.longitude,
      groupId: s.groupId,
      organizerId: s.organizerId,
      createdAt: s.createdAt.toISOString(),
    })),
    prises: group.prises.map((pg) => ({
      id: pg.prise.id,
      userId: pg.prise.userId,
      groupId: pg.groupId,
      photoUrl: pg.prise.photoUrl,
      espece: pg.prise.espece,
      materiel: pg.prise.materiel ?? null,
      date: pg.prise.date.toISOString(),
      latitude: pg.prise.latitude,
      longitude: pg.prise.longitude,
      visibility: pg.prise.visibility,
      createdAt: pg.prise.createdAt.toISOString(),
    })),
  };
}

export async function inviteUser(
  fastify: FastifyInstance,
  userId: string,
  groupId: string,
  payload: { userId: string; role?: "admin" | "member" | "guest" }
) {
  await assertAdmin(fastify, groupId, userId);

  const role = payload.role ?? "member";

  // Conflit si déjà membre
  const exists = await fastify.prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: payload.userId, groupId } },
  });
  if (exists) {
    throw fastify.httpErrors.conflict("Utilisateur déjà membre");
  }

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

  // Interdit : rétrograder le dernier admin
  const admins = await fastify.prisma.groupMember.count({
    where: { groupId, role: "admin" },
  });
  const target = await fastify.prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: targetUserId, groupId } },
  });
  if (!target) {
    throw fastify.httpErrors.notFound("Membre introuvable");
  }
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
  if (!target) {
    throw fastify.httpErrors.notFound("Membre introuvable");
  }

  // Interdit : retirer le dernier admin
  const admins = await fastify.prisma.groupMember.count({
    where: { groupId, role: "admin" },
  });
  if (target.role === "admin" && admins <= 1) {
    throw fastify.httpErrors.badRequest(
      "Impossible de retirer le dernier admin"
    );
  }

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
  if (!me) {
    throw fastify.httpErrors.forbidden("Non membre");
  }

  // Un admin ne peut pas quitter s'il est le dernier admin
  if (me.role === "admin") {
    const admins = await fastify.prisma.groupMember.count({
      where: { groupId, role: "admin" },
    });
    if (admins <= 1) {
      throw fastify.httpErrors.badRequest(
        "Le dernier admin ne peut pas quitter"
      );
    }
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

  // Règle métier : seul le créateur (premier admin) peut supprimer
  const creator = await fastify.prisma.groupMember.findFirst({
    where: { groupId, role: "admin" },
    orderBy: { joinedAt: "asc" },
  });
  if (!creator || creator.userId !== userId) {
    throw fastify.httpErrors.forbidden(
      "Seul le créateur peut supprimer le groupe"
    );
  }

  return fastify.prisma.$transaction(async (tx) => {
    await tx.groupMember.deleteMany({ where: { groupId } });
    await tx.session.deleteMany({ where: { groupId } });
    await tx.priseGroup.deleteMany({ where: { groupId } }); // selon ton schéma
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

  // Réponse conforme à GroupListResponse
  return groups.map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    createdAt: g.createdAt.toISOString(),
    memberCount: g.members.length,
    role: g.members.find((m) => m.userId === userId)?.role || "member",
  }));
}
