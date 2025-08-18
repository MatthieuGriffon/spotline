import type { FastifyInstance } from "fastify";
import { randomBytes } from "crypto";
import { addDays } from "date-fns";
import { InvitationStatus as PrismaInvitationStatus } from "@prisma/client";
import QRCode from "qrcode";

/* =========================
 * Types internes service
 * ========================= */

export type CreateDirectParams =
  | {
      groupId: string;
      inviterId: string;
      by: "userId";
      userId: string;
      joinAuto?: boolean;
    }
  | {
      groupId: string;
      inviterId: string;
      by: "email";
      email: string;
      joinAuto?: boolean;
    };

// ⛔ Supprimer l’alias local pour éviter les conflits avec Prisma
// type InvitationStatus = ...  ← supprimé

/* =========================
 * Utilitaires
 * ========================= */

function genToken() {
  return randomBytes(24).toString("base64url");
}
function isPast(date: Date) {
  return new Date().getTime() > date.getTime();
}

/* =========================
 * Permissions
 * ========================= */

async function assertCanInvite(
  f: FastifyInstance,
  userId: string,
  groupId: string
) {
  const group = await f.prisma.group.findUnique({ where: { id: groupId } });
  if (!group) throw f.httpErrors.notFound("Groupe introuvable");

  if (group.creatorId === userId) return;

  const member = await f.prisma.groupMember.findUnique({
    where: { userId_groupId: { userId, groupId } },
  });
  if (!member || member.role !== "admin") {
    throw f.httpErrors.forbidden("Droits insuffisants");
  }
}

/* =========================
 * Services invitations
 * ========================= */

export async function createDirectInvitation(
  app: FastifyInstance,
  params: CreateDirectParams
) {
  const { prisma, email: mailer } = app;
  // 🔎 On récupère le groupe (pour vérifier et pour le nom dans l’email)
  const group = await prisma.group.findUniqueOrThrow({
    where: { id: params.groupId },
    select: { id: true, name: true },
  });
  // 1) vérif droits
  const gm = await prisma.groupMember.findFirst({
    where: { groupId: params.groupId, userId: params.inviterId, role: "admin" },
    select: { userId: true },
  });
  if (!gm) {
    throw app.httpErrors.forbidden("Vous n’êtes pas admin de ce groupe.");
  }

  // 2) branche selon "by"
  if (params.by === "userId") {
    const already = await prisma.groupMember.findFirst({
      where: { groupId: params.groupId, userId: params.userId },
      select: { userId: true },
    });
    if (already) {
      return {
        ok: true,
        invitationId: null,
        joinAuto: false,
        message: "Déjà membre.",
      };
    }

    if (params.joinAuto) {
      await prisma.groupMember.create({
        data: {
          groupId: params.groupId,
          userId: params.userId,
          role: "member",
        },
      });
      return {
        ok: true,
        invitationId: null,
        joinAuto: true,
        mode: "direct-userId-joined",
      };
    }

    const inv = await prisma.groupInvitation.create({
      data: {
        groupId: params.groupId,
        inviterId: params.inviterId,
        inviteeUserId: params.userId,
        status: PrismaInvitationStatus.PENDING, // ✅ enum
      },
      select: { id: true },
    });
    return {
      ok: true,
      invitationId: inv.id,
      joinAuto: false,
      mode: "direct-userId-pending",
    };
  }

  // by === "email"
  const email = params.email.trim().toLowerCase();
  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true, pseudo: true, email: true },
  });

  if (user) {
    // utilisateur existant → traiter comme direct par id
    const already = await prisma.groupMember.findFirst({
      where: { groupId: params.groupId, userId: user.id },
      select: { userId: true },
    });
    if (already) {
      return {
        ok: true,
        invitationId: null,
        joinAuto: false,
        message: "Déjà membre.",
      };
    }

    if (params.joinAuto) {
      await prisma.groupMember.create({
        data: { groupId: params.groupId, userId: user.id, role: "member" },
      });
      return {
        ok: true,
        invitationId: null,
        joinAuto: true,
        mode: "direct-email-joined",
      };
    }

    const inv = await prisma.groupInvitation.create({
      data: {
        groupId: params.groupId,
        inviterId: params.inviterId,
        inviteeUserId: user.id, // ou inviteeEmail si user inconnu
        status: PrismaInvitationStatus.PENDING,
      },
      select: { id: true },
    });
    const acceptUrl = `${process.env.FRONTEND_URL}/invitation/${inv.id}`;

    try {
      await mailer.sendMail({
        to: user.email!, // ou `email` si user inconnu
        subject: `Invitation à rejoindre ${group.name}`,
        html: `
      <p>Vous avez été invité(e) à rejoindre <b>${group.name}</b>.</p>
      <p><a href="${acceptUrl}">Cliquez ici pour accepter l’invitation</a></p>
    `,
      });
    } catch (e) {
      app.log.warn({ e }, "Email non envoyé");
    }

    return {
      ok: true,
      invitationId: inv.id,
      joinAuto: false,
      mode: "direct-email-pending",
    };
  }

  // utilisateur inconnu → invitation e‑mail "pending" (sans token)
  const inv = await prisma.groupInvitation.create({
    data: {
      groupId: params.groupId,
      inviterId: params.inviterId,
      inviteeEmail: email, // string nullable en DB
      status: PrismaInvitationStatus.PENDING, // ✅ enum (plus de PENDING_EMAIL)
    },
    select: { id: true },
  });

  try {
    await mailer.sendMail({
      to: email,
      subject: "Vous êtes invité(e) à rejoindre un groupe",
      html: `<p>Créez votre compte ou connectez‑vous pour rejoindre le groupe.</p>`,
    });
  } catch (e) {
    app.log.warn({ e }, "Email non envoyé (pending email)");
  }

  return {
    ok: true,
    invitationId: inv.id,
    joinAuto: false,
    mode: "direct-email-pending",
  };
}

export async function createLinkInvitation(
  f: FastifyInstance,
  p: {
    groupId: string;
    inviterId: string;
    expiresInDays?: number;
    maxUses?: number;
  }
) {
  await assertCanInvite(f, p.inviterId, p.groupId);

  const token = genToken();
  const expiresAt = addDays(new Date(), p.expiresInDays ?? 7);
  const maxUses = p.maxUses ?? 5;

  await f.prisma.groupInvitation.create({
    data: {
      groupId: p.groupId,
      inviterId: p.inviterId,
      token,
      expiresAt,
      maxUses,
      usedCount: 0,
      status: PrismaInvitationStatus.PENDING, // ✅ enum
    },
  });

  const url = `${process.env.FRONTEND_URL}/invite/${token}`;
  return { token, url, expiresAt: expiresAt.toISOString(), maxUses };
}

export async function createLinkInvitationQR(
  f: FastifyInstance,
  p: {
    groupId: string;
    inviterId: string;
    expiresInDays?: number;
    maxUses?: number;
    format?: "png" | "svg" | "base64";
  }
) {
  console.log("FRONTEND_URL process.env =", process.env.FRONTEND_URL);

  // 1) Créer le lien via ta fonction existante
  const link = await createLinkInvitation(f, {
    groupId: p.groupId,
    inviterId: p.inviterId,
    expiresInDays: p.expiresInDays,
    maxUses: p.maxUses,
  });

  // On génère l’URL complète vers le frontend
  const fullUrl = `${process.env.FRONTEND_URL}/invite/${link.token}`;

  // Génération du QR code
  const format = p.format ?? "png";
  if (format === "png") {
    const buffer = await QRCode.toBuffer(fullUrl, { type: "png", width: 300 });
    return {
      content: buffer.toString("base64"), // ⚠️ conversion en base64 pour le frontend
      contentType: "image/png",
      filename: `invite-${link.token}.png`,
    };
  }

  if (format === "svg") {
    const svg = await QRCode.toString(fullUrl, { type: "svg", width: 300 });
    return {
      content: svg,
      contentType: "image/svg+xml",
      filename: `invite-${link.token}.svg`,
    };
  }

  const dataUrl = await QRCode.toDataURL(fullUrl, { width: 300 });
  return { content: dataUrl, contentType: "application/json", filename: null };
}

export async function previewLinkInvitation(
  f: FastifyInstance,
  p: { token: string; userId: string | null }
) {
  const inv = await f.prisma.groupInvitation.findUnique({
    where: { token: p.token },
    include: { group: { select: { id: true, name: true } } },
  });
  if (!inv) return { status: "revoked" as const };

  if (inv.status === PrismaInvitationStatus.REVOKED)
    return { status: "revoked" as const }; // ✅ enum
  if (inv.expiresAt && isPast(inv.expiresAt))
    return { status: "expired" as const };
  if (inv.maxUses != null && (inv.usedCount ?? 0) >= inv.maxUses)
    return { status: "quota_reached" as const };

  let alreadyMember = false;
  if (p.userId) {
    const m = await f.prisma.groupMember.findUnique({
      where: { userId_groupId: { groupId: inv.groupId, userId: p.userId } },
    });
    alreadyMember = !!m;
  }

  return {
    status: "ok" as const,
    alreadyMember,
    group: { id: inv.group.id, name: inv.group.name },
  };
}

export async function acceptInvitation(
  f: FastifyInstance,
  p: { token: string; userId: string }
) {
  const inv = await f.prisma.groupInvitation.findUnique({
    where: { token: p.token },
  });
  if (!inv) throw f.httpErrors.notFound("Invitation introuvable");

  if (
    inv.status === PrismaInvitationStatus.REVOKED ||
    inv.status === PrismaInvitationStatus.DECLINED
  ) {
    throw f.httpErrors.conflict("Invitation inactive");
  }
  if (inv.expiresAt && isPast(inv.expiresAt)) {
    throw f.httpErrors.conflict("Invitation expirée");
  }
  if (inv.maxUses != null && (inv.usedCount ?? 0) >= inv.maxUses) {
    throw f.httpErrors.conflict("Quota d’utilisations atteint");
  }

  // Idempotent si déjà membre
  const already = await f.prisma.groupMember.findUnique({
    where: { userId_groupId: { groupId: inv.groupId, userId: p.userId } },
  });
  if (already) return { ok: true, alreadyMember: true };

  await f.prisma.$transaction(async (tx) => {
    await tx.groupMember.create({
      data: { groupId: inv.groupId, userId: p.userId },
    });

    if (inv.token) {
      const nextUsed = (inv.usedCount ?? 0) + 1;
      const reached = inv.maxUses != null && nextUsed >= inv.maxUses;
      await tx.groupInvitation.update({
        where: { id: inv.id },
        data: {
          usedCount: nextUsed,
          status: reached
            ? PrismaInvitationStatus.ACCEPTED
            : PrismaInvitationStatus.PENDING, // ✅ enum
        },
      });
    } else {
      await tx.groupInvitation.update({
        where: { id: inv.id },
        data: { status: PrismaInvitationStatus.ACCEPTED }, // ✅ enum
      });
    }
  });

  return { ok: true };
}

export async function declineInvitation(
  f: FastifyInstance,
  p: { token: string; userId: string }
) {
  const inv = await f.prisma.groupInvitation.findUnique({
    where: { token: p.token },
  });
  if (!inv) throw f.httpErrors.notFound("Invitation introuvable");

  if (
    inv.status === PrismaInvitationStatus.REVOKED ||
    inv.status === PrismaInvitationStatus.DECLINED
  ) {
    throw f.httpErrors.conflict("Invitation inactive");
  }
  if (inv.expiresAt && isPast(inv.expiresAt)) {
    throw f.httpErrors.conflict("Invitation expirée");
  }

  await f.prisma.groupInvitation.update({
    where: { id: inv.id },
    data: { status: PrismaInvitationStatus.DECLINED }, // ✅ enum
  });
  return { ok: true };
}

/* =========================
 * Listes utiles
 * ========================= */

export async function listMyInvitations(
  f: FastifyInstance,
  p: { userId: string }
) {
  const invits = await f.prisma.groupInvitation.findMany({
    where: {
      inviteeUserId: p.userId,
      status: {
        in: [
          PrismaInvitationStatus.PENDING,
          PrismaInvitationStatus.ACCEPTED,
          PrismaInvitationStatus.DECLINED,
          PrismaInvitationStatus.EXPIRED,
          PrismaInvitationStatus.REVOKED,
        ],
      }, // ✅ enum
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      status: true,
      group: { select: { id: true, name: true } },
      inviter: { select: { pseudo: true } },
    },
  });
  f.log.info({ count: invits.length }, "myInvitations found");
  return {
    invitations: invits.map((i) => ({
      id: i.id,
      groupId: i.group.id,
      groupName: i.group.name,
      inviterPseudo: i.inviter.pseudo,
      status: i.status, // enum → string OK pour la réponse
      createdAt: i.createdAt.toISOString(),
    })),
  };
}

export async function listGroupInvitations(
  f: FastifyInstance,
  p: { groupId: string; requesterId: string }
) {
  await assertCanInvite(f, p.requesterId, p.groupId);

  const now = new Date();

  const rows = await f.prisma.groupInvitation.findMany({
    where: {
      groupId: p.groupId,
      status: PrismaInvitationStatus.PENDING, // ← uniquement PENDING
      OR: [
        { token: null }, // directes
        {
          // liens valides (pas expirés)
          token: { not: null },
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      token: true,
      usedCount: true,
      maxUses: true,
      expiresAt: true,
      createdAt: true,
      inviteeUserId: true,
      inviteeEmail: true,
    },
  });

  // Post-filtre quota (Prisma ne peut pas faire usedCount < maxUses en SQL)
  const active = rows.filter((r) => {
    if (!r.token) return true; // directes PENDING
    if (r.maxUses == null) return true; // illimité
    const used = r.usedCount ?? 0;
    return used < r.maxUses; // quota non atteint
  });

  return active.map((r) => ({
    id: r.id,
    status: r.status, // 'PENDING'
    token: r.token ?? null,
    usedCount: r.usedCount ?? 0,
    maxUses: r.maxUses ?? null,
    expiresAt: r.expiresAt ? r.expiresAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
    targetEmail: r.inviteeEmail ?? null,
    type: r.token ? ("link" as const) : ("direct" as const),
  }));
}

export async function revokeInvitation(
  f: FastifyInstance,
  p: { groupId: string; invitationId: string; requesterId: string }
) {
  await assertCanInvite(f, p.requesterId, p.groupId);

  const inv = await f.prisma.groupInvitation.findUnique({
    where: { id: p.invitationId },
  });
  if (!inv || inv.groupId !== p.groupId)
    throw f.httpErrors.notFound("Invitation introuvable");

  if (inv.status === PrismaInvitationStatus.REVOKED) return { ok: true }; // idempotent

  await f.prisma.groupInvitation.update({
    where: { id: inv.id },
    data: { status: PrismaInvitationStatus.REVOKED }, // ✅ enum
  });
  return { ok: true };
}
export async function claimPendingInvitationsOnLogin(
  f: FastifyInstance,
  p: { userId: string; email?: string | null }
) {
  const email = p.email?.trim().toLowerCase() || null;

  // 1) Invitations “direct PENDING” par userId
  const direct = await f.prisma.groupInvitation.findMany({
    where: {
      inviteeUserId: p.userId,
      status: PrismaInvitationStatus.PENDING,
    },
    select: { id: true, groupId: true },
  });

  // 2) Invitations “email PENDING” par email (si fourni)
  const byEmail = email
    ? await f.prisma.groupInvitation.findMany({
        where: {
          inviteeEmail: email,
          status: PrismaInvitationStatus.PENDING,
        },
        select: { id: true, groupId: true },
      })
    : [];

  const all = [...direct, ...byEmail];

  for (const inv of all) {
    // déjà membre ?
    const already = await f.prisma.groupMember.findUnique({
      where: { userId_groupId: { userId: p.userId, groupId: inv.groupId } },
      select: { userId: true },
    });
    if (!already) {
      await f.prisma.groupMember.create({
        data: { groupId: inv.groupId, userId: p.userId, role: "member" },
      });
    }

    await f.prisma.groupInvitation.update({
      where: { id: inv.id },
      data: {
        inviteeUserId: p.userId, // sécurise le lien si c’était une invite par email
        status: PrismaInvitationStatus.ACCEPTED,
      },
    });
  }

  return { ok: true, claimed: all.length };
}

export async function linkEmailInvitationsOnLogin(
  f: FastifyInstance,
  p: { userId: string; email: string }
) {
  await f.prisma.groupInvitation.updateMany({
    where: {
      inviteeEmail: { equals: p.email, mode: "insensitive" },
      inviteeUserId: null,
      status: { in: [PrismaInvitationStatus.PENDING] },
    },
    data: {
      inviteeUserId: p.userId,
      // on peut garder inviteeEmail, pas obligé de le nuller
    },
  });
}

export async function actDirectInvitationForUser(
  fastify: FastifyInstance,
  params: { invitationId: string; userId: string; action: "accept" | "decline" }
) {
  const { invitationId, userId, action } = params;

  const invite = await fastify.prisma.groupInvitation.findUnique({
    where: { id: invitationId },
    include: { group: true },
  });

  if (!invite || invite.status !== "PENDING") {
    return { ok: false, reason: "not_found" };
  }

  if (action === "decline") {
    await fastify.prisma.groupInvitation.update({
      where: { id: invitationId },
      data: { status: "DECLINED" },
    });
    return {
      ok: true,
      groupId: invite.groupId,
      groupName: invite.group?.name ?? null,
    };
  }

  // accept
  await fastify.prisma.groupMember.upsert({
    where: { userId_groupId: { userId, groupId: invite.groupId } },
    update: {},
    create: { userId, groupId: invite.groupId, role: "member" },
  });

  await fastify.prisma.groupInvitation.update({
    where: { id: invitationId },
    data: { status: "ACCEPTED" },
  });

  return {
    ok: true,
    groupId: invite.groupId,
    groupName: invite.group?.name ?? null,
  };
}

export async function consumeLinkInvitationForUser(
  f: FastifyInstance,
  {
    token,
    userId,
    action,
  }: { token: string; userId: string; action: "accept" | "decline" }
) {
  f.log.info({ action }, "[consumeLinkInvitationForUser] action reçue");
if (action === "decline") {
  const invite = await f.prisma.groupInvitation.findFirst({
    where: { token, status: "PENDING" },
    include: { group: true },
  });

  await f.prisma.groupInvitation.updateMany({
    where: { token, status: "PENDING" },
    data: { status: "DECLINED" },
  });

  return {
    ok: true,
    groupId: invite?.groupId,
    groupName: invite?.group?.name,
  };
}

  const invite = await f.prisma.groupInvitation.findFirst({
    where: { token, status: "PENDING" },
    include: { group: true },
  });
  f.log.info(
    { token, invite },
    "[consumeLinkInvitationForUser] invite trouvé ?"
  );


  if (!invite) {
      f.log.info(
        { token },
        "[consumeLinkInvitationForUser] invite introuvable"
      );

    return { ok: false, reason: "invalid" };
  }

  // Vérif quotas / expiry
  if (invite.maxUses && invite.usedCount >= invite.maxUses) {
    return {
      ok: false,
      reason: "quota_reached",
      groupId: invite.groupId,
      groupName: invite.group.name,
    };
  }
  if (invite.expiresAt && new Date() > invite.expiresAt) {
    return {
      ok: false,
      reason: "expired",
      groupId: invite.groupId,
      groupName: invite.group.name,
    };
  }

  // Ajouter au groupe
  await f.prisma.groupMember.upsert({
    where: { userId_groupId: { userId, groupId: invite.groupId } },
    update: {},
    create: { userId, groupId: invite.groupId, role: "member" },
  });

  // Marquer comme ACCEPTED + incrémenter compteur
  await f.prisma.groupInvitation.update({
    where: { id: invite.id },
    data: {
      usedCount: { increment: 1 },
      status:
        invite.maxUses && invite.usedCount + 1 >= invite.maxUses
          ? "EXPIRED"
          : "ACCEPTED",
    },
  });

 f.log.info(
   { groupId: invite.groupId, groupName: invite.group.name },
   "[consumeLinkInvitationForUser] cas ACCEPT"
 );


  return {
    ok: true,
    groupId: invite.groupId,
    groupName: invite.group.name,
  };
}