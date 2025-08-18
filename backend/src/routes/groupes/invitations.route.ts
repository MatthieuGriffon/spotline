import type { FastifyInstance } from "fastify";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { Static } from "@sinclair/typebox";
import { Type } from "@sinclair/typebox";
import { requireAuth } from "@/middlewares/requireAuth";
import { createQR } from "@/controllers/groupes/invitations.controller";
import * as C from "@/controllers/groupes/invitations.controller";
import * as S from "@/schemas/group/invitations.schema";

const ErrorResponse = Type.Object({ message: Type.String() });
type App = FastifyInstance<any, any, any, any, TypeBoxTypeProvider>;
import {
  GenerateInvitationQRParams,
  GenerateInvitationQRBody,
} from "@/schemas/group/groupInvitationsQR.schema";

export default async function groupInvitationsRoutes(app: App) {
  /* ========== A) Invitation directe (discriminée email | userId) ========== */
  app.post<{
    Params: Static<typeof S.GroupIdParams>;
    Body: Static<typeof S.CreateDirectInvitationBody>;
  }>(
    "/:groupId/invitations",
    {
      preHandler: [requireAuth],
      schema: {
        tags: ["Invitations"],
        summary: "Créer une invitation directe",
        params: S.GroupIdParams,
        body: S.CreateDirectInvitationBody,
        response: {
          200: S.CreateDirectInvitationResponse,
          400: ErrorResponse,
          401: ErrorResponse,
          403: ErrorResponse,
          404: ErrorResponse,
          409: ErrorResponse,
        },
      },
    },
    C.createDirect
  );

  /* ========== B) Créer un lien/QR ========== */
  app.post<{
    Params: Static<typeof S.GroupIdParams>;
    Body: Static<typeof S.CreateLinkInvitationBody>;
  }>(
    "/:groupId/invitations/link",
    {
      preHandler: [requireAuth],
      schema: {
        tags: ["Invitations"],
        summary: "Créer un lien/QR d’invitation",
        params: S.GroupIdParams,
        body: S.CreateLinkInvitationBody,
        response: {
          200: S.CreateLinkInvitationResponse,
          400: ErrorResponse,
          401: ErrorResponse,
          403: ErrorResponse,
          404: ErrorResponse,
        },
      },
    },
    C.createLink
  );

  /* ========== Admin — Lister les invitations d’un groupe ========== */
  app.get<{ Params: Static<typeof S.GroupIdParams> }>(
    "/:groupId/invitations/admin",
    {
      preHandler: [requireAuth],
      schema: {
        tags: ["Invitations"],
        summary: "Admin: Lister les invitations d’un groupe",
        params: S.GroupIdParams,
        response: {
          200: S.GroupInvitationsAdminResponse,
          401: ErrorResponse,
          403: ErrorResponse,
          404: ErrorResponse,
        },
      },
    },
    C.listForGroup
  );

  /* ========== Admin — Révoquer une invitation ========== */
  const RevokeInvitationParams = Type.Object({
    groupId: Type.String(),
    invitationId: Type.String(),
  });
  const OkResponse = Type.Object({ ok: Type.Boolean() });

  app.post<{ Params: Static<typeof RevokeInvitationParams> }>(
    "/:groupId/invitations/:invitationId/revoke",
    {
      preHandler: [requireAuth],
      schema: {
        tags: ["Invitations"],
        summary: "Admin: Révoquer une invitation",
        params: RevokeInvitationParams,
        response: {
          200: OkResponse,
          401: ErrorResponse,
          403: ErrorResponse,
          404: ErrorResponse,
        },
      },
    },
    C.revoke
  );

  /* ========== Mes invitations ========== */

  // GET /me/invitations
  app.get(
    "/me/invitations",
    {
      preHandler: [requireAuth],
      schema: {
        tags: ["Invitations"],
        summary: "Lister mes invitations",
        response: { 200: S.MyInvitesResponse, 401: ErrorResponse },
      },
    },
    C.listMine
  );

  // POST /me/invitations/:id/act (accept/decline)
  const InvitationIdParams = Type.Object({ id: Type.String() });
  type InvitationIdParamsType = Static<typeof InvitationIdParams>;

  app.post<{
    Params: InvitationIdParamsType;
    Body: Static<typeof S.AcceptOrDeclineBody>;
  }>(
    "/me/invitations/:id/act",
    {
      preHandler: [requireAuth],
      schema: {
        tags: ["Invitations"],
        summary: "Accepter/Refuser une invitation directe (moi)",
        params: InvitationIdParams,
        body: S.AcceptOrDeclineBody,
        response: {
          200: Type.Object({
            ok: Type.Boolean(),
            groupId: Type.Optional(Type.String()),
            groupName: Type.Optional(Type.String()),
          }),
          400: ErrorResponse,
          401: ErrorResponse,
          403: ErrorResponse,
          404: ErrorResponse,
          409: ErrorResponse,
        },
      },
    },
    C.actDirectForMe
  );
  // Types dérivés des schémas
  type GenerateInvitationQRParamsType = Static<
    typeof GenerateInvitationQRParams
  >;
  type GenerateInvitationQRBodyType = Static<typeof GenerateInvitationQRBody>;

  // POST /groups/:groupId/invitations/qr
  app.post<{
    Params: GenerateInvitationQRParamsType;
    Body: GenerateInvitationQRBodyType;
  }>(
    "/:groupId/invitations/qr",
    {
      preHandler: [requireAuth],
      schema: {
        tags: ["Invitations"],
        summary: "Générer un QR code pour une invitation de groupe",
        params: GenerateInvitationQRParams,
        body: GenerateInvitationQRBody,
        response: {
          200: { description: "QR code PNG/SVG/Base64", type: "string" },
          400: ErrorResponse,
          401: ErrorResponse,
          403: ErrorResponse,
          404: ErrorResponse,
        },
      },
    },
    C.createQR
  );

  // ========== Invitation par lien (accept/decline) ==========
const InviteTokenParams = Type.Object({ token: Type.String() });
type InviteTokenParamsType = Static<typeof InviteTokenParams>;

app.post<{
  Params: InviteTokenParamsType;
  Body: Static<typeof S.AcceptOrDeclineBody>;
}>(
  "/invite/:token/act",
  {
    schema: {
      tags: ["Invitations"],
      summary: "Accepter/Refuser une invitation par lien",
      params: InviteTokenParams,
      body: S.AcceptOrDeclineBody,
      response: {
        200: S.ActOnInviteResponse,
        400: ErrorResponse,
        401: ErrorResponse,
        403: ErrorResponse,
        404: ErrorResponse,
        409: ErrorResponse,
      },
    },
  },
  C.actOnInvite
);

}
