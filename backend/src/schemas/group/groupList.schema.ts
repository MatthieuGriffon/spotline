import { Static, Type } from "@sinclair/typebox";

export const GroupListItem = Type.Object({
  id: Type.String(),
  name: Type.String(),
  description: Type.Optional(Type.String()),
  createdAt: Type.String({ format: "date-time" }),
  memberCount: Type.Number(),
  role: Type.Union([
    Type.Literal("admin"),
    Type.Literal("member"),
    Type.Literal("guest"),
  ]),
});

export const GroupListResponse = Type.Array(GroupListItem);

export type GroupListItemType = Static<typeof GroupListItem>;
export type GroupListResponseType = Static<typeof GroupListResponse>;
