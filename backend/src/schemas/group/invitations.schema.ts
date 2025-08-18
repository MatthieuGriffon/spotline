import { Type, Static } from "@sinclair/typebox";

/* =========================
 * Params
 * ========================= */
export const GroupIdParams = Type.Object(
  {
    groupId: Type.String(),
  },
  { additionalProperties: false }
);
export type GroupIdParamsType = Static<typeof GroupIdParams>;

export const InviteTokenParams = Type.Object(
  {
    token: Type.String(),
  },
  { additionalProperties: false }
);
export type InviteTokenParamsType = Static<typeof InviteTokenParams>;

/* =========================
 * Bodies
 * ========================= */

/** A) Direct — body discriminé (email | userId) */
export const CreateDirectInvitationBody = Type.Union([
  Type.Object(
    {
      by: Type.Literal("email"),
      email: Type.String({ format: "email" }),
      joinAuto: Type.Optional(Type.Boolean()),
    },
    { additionalProperties: false }
  ),

  Type.Object(
    {
      by: Type.Literal("userId"),
      userId: Type.String({ minLength: 1 }),
      joinAuto: Type.Optional(Type.Boolean()),
    },
    { additionalProperties: false }
  ),
]);
export type CreateDirectInvitationBodyType = Static<
  typeof CreateDirectInvitationBody
>;

/** B) Link — body */
export const CreateLinkInvitationBody = Type.Object(
  {
    expiresInDays: Type.Optional(Type.Integer({ minimum: 1, maximum: 30 })),
    maxUses: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })),
  },
  { additionalProperties: false }
);
export type CreateLinkInvitationBodyType = Static<
  typeof CreateLinkInvitationBody
>;

/** C) Accept/Decline — body */
export const AcceptOrDeclineBody = Type.Object(
  {
    action: Type.Union([Type.Literal("accept"), Type.Literal("decline")]),
  },
  { additionalProperties: false }
);
export type AcceptOrDeclineBodyType = Static<typeof AcceptOrDeclineBody>;

/* =========================
 * Responses
 * ========================= */

/** A) Direct — response minimal (mode indicatif) */
export const CreateDirectInvitationResponse = Type.Object(
  {
    ok: Type.Boolean(),
    mode: Type.String(), // ex: direct-email-pending | direct-email-joined | direct-userId-joined
    invitationId: Type.Optional(Type.String()),
  },
  { additionalProperties: false }
);
export type CreateDirectInvitationResponseType = Static<
  typeof CreateDirectInvitationResponse
>;

/** B) Link — response (match la vue: token/url/expires/maxUses) */
export const CreateLinkInvitationResponse = Type.Object(
  {
    token: Type.String(),
    url: Type.String(),
    expiresAt: Type.String(), // ISO
    maxUses: Type.Integer(),
  },
  { additionalProperties: false }
);
export type CreateLinkInvitationResponseType = Static<
  typeof CreateLinkInvitationResponse
>;

/** Preview (via token) */
export const InvitationPreviewStatus = Type.Union([
  Type.Literal("ok"),
  Type.Literal("expired"),
  Type.Literal("quota_reached"),
  Type.Literal("revoked"),
]);
export type InvitationPreviewStatusType = Static<
  typeof InvitationPreviewStatus
>;

export const InvitationPreviewResponse = Type.Object(
  {
    group: Type.Object(
      {
        id: Type.String(),
        name: Type.String(),
      },
      { additionalProperties: false }
    ),
    alreadyMember: Type.Boolean(),
    status: InvitationPreviewStatus,
  },
  { additionalProperties: false }
);
export type InvitationPreviewResponseType = Static<
  typeof InvitationPreviewResponse
>;

/** Mes invitations (invitee = moi) */
export const MyInvitesItem = Type.Object(
  {
    id: Type.String(), // id de l’invitation
    groupId: Type.String(),
    groupName: Type.String(),
    inviterPseudo: Type.String(),
    status: Type.String(), // PENDING | ACCEPTED | DECLINED | EXPIRED | REVOKED
    createdAt: Type.String(), // ISO
  },
  { additionalProperties: false }
);
export type MyInvitesItemType = Static<typeof MyInvitesItem>;

export const MyInvitesResponse = Type.Object(
  {
    invitations: Type.Array(MyInvitesItem),
  },
  { additionalProperties: false }
);
export type MyInvitesResponseType = Static<typeof MyInvitesResponse>;

/** Admin — liste des invitations d’un groupe (shape attendue par GroupDetailView.vue) */
export const GroupInvitationsAdminItem = Type.Object(
  {
    id: Type.String(),
    type: Type.Union([Type.Literal("direct"), Type.Literal("link")]),
    status: Type.String(), // PENDING | ACCEPTED | REVOKED | EXPIRED...
    email: Type.Union([Type.String({ format: "email" }), Type.Null()]), // direct: peut être null
    uses: Type.Integer(), // nombre d’utilisations actuelles
    maxUses: Type.Union([Type.Integer(), Type.Null()]),
    expiresAt: Type.Union([Type.String(), Type.Null()]), // ISO ou null
    createdAt: Type.String(), // ISO
  },
  { additionalProperties: false }
);
export type GroupInvitationsAdminItemType = Static<
  typeof GroupInvitationsAdminItem
>;

export const GroupInvitationsAdminResponse = Type.Object(
  {
    invitations: Type.Array(GroupInvitationsAdminItem),
  },
  { additionalProperties: false }
);
export type GroupInvitationsAdminResponseType = Static<
  typeof GroupInvitationsAdminResponse
>;
export const ActOnInviteResponse = Type.Object(
  {
    ok: Type.Boolean(),
  },
  { additionalProperties: true }
);
export type ActOnInviteResponseType = Static<typeof ActOnInviteResponse>;
