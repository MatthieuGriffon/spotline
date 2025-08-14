import type { FastifyInstance } from "fastify";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import * as C from "@/controllers/groupes/invitations.controller";
import * as S from "@/schemas/group/invitations.schema";

type App = FastifyInstance<any, any, any, any, TypeBoxTypeProvider>;
const ErrorResponse = Type.Object({ message: Type.String() });
const NeedsAuthResponse = Type.Object({ needsAuth: Type.Boolean() });
const ActOnInviteResponse200 = Type.Object({
  ok: Type.Boolean(),
  alreadyMember: Type.Optional(Type.Boolean()),
});

export default async function invitePublicRoutes(app: App) {
  // Preview (public)
  app.get(
    "/invite/preview/:token",
    {
      schema: {
        tags: ["Invitations"],
        summary: "Prévisualiser une invitation par lien/QR",
        // ⚠️ Service renvoie {status:'revoked'} → pas de 404
        params: S.InviteTokenParams,
        response: { 200: S.InvitationPreviewResponse },
      },
    },
    C.preview
  );

  // Accepter/Refuser (public → 401 needsAuth si pas connecté)
  app.post(
    "/invite/:token",
    {
      schema: {
        tags: ["Invitations"],
        summary: "Accepter ou refuser une invitation par lien/QR",
        params: S.InviteTokenParams,
        body: S.AcceptOrDeclineBody,
        response: {
          200: ActOnInviteResponse200,
          401: NeedsAuthResponse,
          404: ErrorResponse,
          409: ErrorResponse,
        },
      },
    },
    C.actOnInvite
  );
}
