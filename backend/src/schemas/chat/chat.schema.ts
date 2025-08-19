import { Type } from "@sinclair/typebox";

// ------------------------------
// Enum alignée sur Prisma
// ------------------------------
export const MessageReferenceType = Type.Union([
  Type.Literal("SPOT"),
  Type.Literal("PRISE"),
  Type.Literal("SESSION"),
]);

// ------------------------------
// Query (GET /groupes/:id/messages)
// ------------------------------
export const GetMessagesQuery = Type.Object({
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })),
  offset: Type.Optional(Type.Integer({ minimum: 0 })),
});

// ------------------------------
// Body (POST /groupes/:id/messages)
// ------------------------------
export const PostMessageBody = Type.Object({
  content: Type.String({ minLength: 1, maxLength: 2000 }),
  referenceType: Type.Optional(Type.Union([MessageReferenceType, Type.Null()])),
  referenceId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
});

// ------------------------------
// Response (Message unique)
// ------------------------------
export const MessageResponse = Type.Object({
  id: Type.String(),
  content: Type.String(),
  createdAt: Type.String({ format: "date-time" }),
  user: Type.Object({
    id: Type.String(),
    pseudo: Type.String(),
    imageUrl: Type.Optional(Type.String()),
  }),
  referenceType: Type.Optional(Type.Union([MessageReferenceType, Type.Null()])),
  referenceId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
});

// ------------------------------
// Response (GET messages)
// ------------------------------
export const GetMessagesResponse = Type.Object({
  messages: Type.Array(MessageResponse),
  pagination: Type.Object({
    limit: Type.Integer(),
    offset: Type.Integer(),
    total: Type.Integer(),
  }),
});

// ------------------------------
// Response (POST message)
// ------------------------------
export const PostMessageResponse = MessageResponse;
