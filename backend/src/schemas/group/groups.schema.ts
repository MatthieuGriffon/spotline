import { Type } from "@sinclair/typebox";

// 📌 ENUMS
export const GroupRoleEnum = Type.Union([
  Type.Literal("admin"),
  Type.Literal("member"),
  Type.Literal("guest"),
]);

// Visibilité pour Prise
export const VisibilityEnum = Type.Union([
  Type.Literal("public"),
  Type.Literal("private"),
  Type.Literal("group"),
]);

// 📌 BODY SCHEMAS
export const CreateGroupBody = Type.Object({
  name: Type.String({ minLength: 2, maxLength: 80 }),
  description: Type.Optional(Type.String({ maxLength: 500 })),
});

export const UpdateGroupBody = Type.Object({
  name: Type.Optional(Type.String({ minLength: 2, maxLength: 80 })),
  description: Type.Optional(Type.String({ maxLength: 500 })),
});

export const InviteUserBody = Type.Object({
  userId: Type.String(), // UUID/cuid
  role: Type.Optional(GroupRoleEnum), // défaut: member
});

export const ChangeRoleBody = Type.Object({
  role: GroupRoleEnum,
});

// 📌 PARAMS SCHEMAS
export const GroupParams = Type.Object({
  id: Type.String(),
});

export const MemberParams = Type.Object({
  id: Type.String(), // groupId
  userId: Type.String(), // target member
});

// 📌 RESPONSES COMMUNES
export const SuccessResponse = Type.Object({
  success: Type.Boolean({ default: true }),
  message: Type.String(),
});

export const ErrorResponse = Type.Object({
  success: Type.Boolean({ default: false }),
  message: Type.String(),
});

// 📌 Group (liste)
export const GroupBase = Type.Object({
  id: Type.String(),
  name: Type.String(),
  description: Type.Optional(Type.String()),
  createdAt: Type.String({ format: "date-time" }),
  memberCount: Type.Number(),
  role: GroupRoleEnum,
});

export const GroupListResponse = Type.Array(GroupBase);

// ─────────────────────────────────────────────
// 📌 Détails membres (avec joinedAt)
export const GroupMemberDetail = Type.Object({
  userId: Type.String(),
  pseudo: Type.String(),
  role: GroupRoleEnum,
  joinedAt: Type.String({ format: "date-time" }),
});

// 📌 Résumés pour sessions et prises
export const SessionSummary = Type.Object({
  id: Type.String(),
  title: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  date: Type.String({ format: "date-time" }),
  latitude: Type.Number(),
  longitude: Type.Number(),
  groupId: Type.String(),
  organizerId: Type.String(),
  createdAt: Type.String({ format: "date-time" }),
});

export const PriseSummary = Type.Object({
  id: Type.String(),
  userId: Type.String(),
  groupId: Type.Union([Type.String(), Type.Null()]), // peut être null si prise hors groupe
  photoUrl: Type.String(),
  espece: Type.String(),
  materiel: Type.Union([Type.String(), Type.Null()]),
  date: Type.String({ format: "date-time" }),
  latitude: Type.Number(),
  longitude: Type.Number(),
  visibility: VisibilityEnum,
  createdAt: Type.String({ format: "date-time" }),
});

// 📌 Group detail (réponse GET /groupes/:id et POST /groupes)
export const GroupDetailResponse = Type.Object({
  id: Type.String(),
  name: Type.String(),
  description: Type.Optional(Type.String()),
  createdAt: Type.String({ format: "date-time" }),
  creatorId: Type.String(),
  members: Type.Array(GroupMemberDetail),
  sessions: Type.Array(SessionSummary),
  prises: Type.Array(PriseSummary),
});
