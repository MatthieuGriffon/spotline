import type { FastifyRequest, FastifyReply } from "fastify";
import type { SessionUser } from "@/types/fastify";
import {
  createDirectInvitation,
  createLinkInvitation,
  previewLinkInvitation,
  acceptInvitation,
  declineInvitation,
  listMyInvitations,
  listGroupInvitations,
  revokeInvitation,
  actDirectInvitationForUser,
} from "@/services/groupes/invitations.service";

import type {
  GroupIdParamsType,
  InviteTokenParamsType,
  CreateDirectInvitationBodyType,
  CreateLinkInvitationBodyType,
  AcceptOrDeclineBodyType,
} from "@/schemas/group/invitations.schema";

// Petit helper pour l’API session get/set (évite les soucis de typings)
function sessionAPI(req: FastifyRequest) {
  return req.session as unknown as {
    get<T>(key: string): T | undefined;
    set(key: string, value: any): void;
    delete?: (key: string) => void;
  };
}

/* ========== A) Invitation directe (admin -> user existant) ========== */
export async function createDirect(
  req: FastifyRequest<{
    Params: GroupIdParamsType;
    Body: CreateDirectInvitationBodyType;
  }>,
  reply: FastifyReply
) {
  const { groupId } = req.params;
  const user = req.session.user! as SessionUser;

  const body = req.body;
  const base = {
    groupId,
    inviterId: user.id,
    joinAuto: body.joinAuto ?? false,
  };

  // Discriminer via "by"
  const result =
    body.by === "email"
      ? await createDirectInvitation(req.server, {
          ...base,
          by: "email",
          email: body.email,
        })
      : await createDirectInvitation(req.server, {
          ...base,
          by: "userId",
          userId: body.userId,
        });

  return reply.send(result);
}

/* ========== B) Créer un lien/QR ========== */
export async function createLink(
  req: FastifyRequest<{
    Params: GroupIdParamsType;
    Body: CreateLinkInvitationBodyType;
  }>,
  reply: FastifyReply
) {
  const { groupId } = req.params;
  const { expiresInDays, maxUses } = req.body;
  const user = req.session.user!;
  const result = await createLinkInvitation(req.server, {
    groupId,
    inviterId: user.id,
    expiresInDays,
    maxUses,
  });
  return reply.send(result);
}

/* ========== B/C) Preview d’un lien/QR (connecté ou non) ========== */
export async function preview(
  req: FastifyRequest<{ Params: InviteTokenParamsType }>,
  reply: FastifyReply
) {
  const { token } = req.params;
  const userId = req.session.user?.id ?? null;
  const result = await previewLinkInvitation(req.server, { token, userId });
  return reply.send(result);
}

/* ========== B/C) Accepter / Refuser (connecté, sinon needsAuth) ========== */
export async function actOnInvite(
  req: FastifyRequest<{
    Params: InviteTokenParamsType;
    Body: AcceptOrDeclineBodyType;
  }>,
  reply: FastifyReply
) {
  const { token } = req.params;
  const { action } = req.body;

  const session = sessionAPI(req);
  const user = session.get<SessionUser>("user");

  if (!user) {
    session.set("pendingInvite", { token, action } as {
      token: string;
      action: "accept" | "decline";
    });
    return reply.code(401).send({ needsAuth: true });
  }

  const svc = action === "accept" ? acceptInvitation : declineInvitation;
  const result = await svc(req.server, { token, userId: user.id });
  return reply.send(result);
}

/* ========== A) Liste des invitations reçues (bannière dashboard) ========== */
export async function listMine(req: FastifyRequest, reply: FastifyReply) {
  const user = req.session.user!; // requireAuth sur la route → safe
  const result = await listMyInvitations(req.server, { userId: user.id });
  return reply.send(result);
}

/* ========== (Admin de groupe) Lister les invitations d’un groupe ========== */
export async function listForGroup(
  req: FastifyRequest<{ Params: GroupIdParamsType }>,
  reply: FastifyReply
) {
  const user = req.session.user!;
  const { groupId } = req.params;

  const rows = await listGroupInvitations(req.server, {
    groupId,
    requesterId: user.id,
  });

  // Map vers la shape attendue par le front (S.GroupInvitationsAdminResponse)
  const invitations = rows.map((r: any) => ({
    id: r.id,
    type: r.type as "direct" | "link",
    status: r.status,
    email: r.targetEmail ?? null, // ← mappe champ DB -> contrat front
    uses: typeof r.usedCount === "number" ? r.usedCount : 0, // ← usedCount -> uses
    maxUses: r.maxUses ?? null,
    expiresAt: r.expiresAt ? new Date(r.expiresAt).toISOString() : null,
    createdAt: r.createdAt
      ? new Date(r.createdAt).toISOString()
      : new Date().toISOString(),
  }));

  return reply.send({ invitations });
}

/* ========== (Admin de groupe) Révoquer une invitation ========== */
export async function revoke(
  req: FastifyRequest<{ Params: { groupId: string; invitationId: string } }>,
  reply: FastifyReply
) {
  const user = req.session.user!;
  const { groupId, invitationId } = req.params;
  const result = await revokeInvitation(req.server, {
    groupId,
    invitationId,
    requesterId: user.id,
  });
  return reply.send(result);
}

export async function actDirectForMe(
  req: FastifyRequest<{
    Params: { id: string };
    Body: AcceptOrDeclineBodyType;
  }>,
  reply: FastifyReply
) {
  const user = req.session.user!;
  const { id } = req.params;
  const { action } = req.body;
  const result = await actDirectInvitationForUser(req.server, {
    invitationId: id,
    userId: user.id,
    action,
  });
  return reply.send(result);
}
