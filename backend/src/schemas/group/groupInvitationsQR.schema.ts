import { Type, Static } from "@sinclair/typebox";

// Regex basique pour CUID v2 ou similaire
export const Cuid = Type.String({
  pattern: "^c[a-z0-9]{8,}$",
  description: "CUID",
});

export const GenerateInvitationQRParams = Type.Object({
  groupId: Cuid,
});

export const GenerateInvitationQRBody = Type.Object({
  expiresInDays: Type.Optional(Type.Integer({ minimum: 1, maximum: 365 })),
  maxUses: Type.Optional(Type.Integer({ minimum: 1, maximum: 1000 })),
  format: Type.Optional(
    Type.Union([
      Type.Literal("png"),
      Type.Literal("svg"),
      Type.Literal("base64"),
    ])
  ),
});

export type GenerateInvitationQRParamsType = Static<
  typeof GenerateInvitationQRParams
>;
export type GenerateInvitationQRBodyType = Static<
  typeof GenerateInvitationQRBody
>;
