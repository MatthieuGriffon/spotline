import { Type } from "@sinclair/typebox";

export const GroupRoleEnum = Type.Union([
  Type.Literal("admin"),
  Type.Literal("member"),
  Type.Literal("guest"),
]);

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

export const GroupParams = Type.Object({
  id: Type.String(),
});

export const MemberParams = Type.Object({
  id: Type.String(), // groupId
  userId: Type.String(), // target member
});
