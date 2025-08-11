import { Type } from "@sinclair/typebox";

// 📌 ENUMS
export const GroupRoleEnum = Type.Union([
  Type.Literal("admin"),
  Type.Literal("member"),
  Type.Literal("guest"),
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

// 📌 RESPONSE SCHEMAS
export const SuccessResponse = Type.Object({
  success: Type.Boolean({ default: true }),
  message: Type.String(),
});

export const ErrorResponse = Type.Object({
  success: Type.Boolean({ default: false }),
  message: Type.String(),
});

// 📌 Group object réutilisable
export const GroupBase = Type.Object({
  id: Type.String(),
  name: Type.String(),
  description: Type.Optional(Type.String()),
  createdAt: Type.String({ format: "date-time" }),
  memberCount: Type.Number(),
  role: GroupRoleEnum,
});

export const GroupListResponse = Type.Array(GroupBase);

export const GroupDetailResponse = Type.Object({
  id: Type.String(),
  name: Type.String(),
  description: Type.Optional(Type.String()),
  createdAt: Type.String({ format: "date-time" }),
  creatorId: Type.String(),
  members: Type.Array(
    Type.Object({
      userId: Type.String(),
      pseudo: Type.String(),
      role: GroupRoleEnum,
    })
  ),
});
