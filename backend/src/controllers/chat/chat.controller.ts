import type { FastifyRequest, FastifyReply } from "fastify";
import {
  GetMessagesQuery,
  PostMessageBody,
  GetMessagesResponse,
  PostMessageResponse,
} from "@/schemas/chat/chat.schema";
import * as chatService from "@/services/chat/chat.service";

// ------------------------------
// GET /groups/:id/messages
// ------------------------------
export async function getMessages(
  request: FastifyRequest<{
    Params: { id: string };
    Querystring: typeof GetMessagesQuery;
  }>,
  reply: FastifyReply
) {
  const { id: groupId } = request.params;
  const { limit = 50, offset = 0 } = request.query;

  const result = await chatService.getMessages(
    request.server,
    groupId,
    limit,
    offset
  );

  return reply
    .code(200)
    .send(result satisfies typeof GetMessagesResponse.static);
}

// ------------------------------
// POST /groups/:id/messages
// ------------------------------
export async function postMessage(
  request: FastifyRequest<{
    Params: { id: string };
    Body: typeof PostMessageBody;
  }>,
  reply: FastifyReply
) {
  const { id: groupId } = request.params;
  const userId = request.session.user!.id; // ✅ non-null assertion

  const { content, referenceType, referenceId } = request.body;

  const message = await chatService.createMessage(
    request.server,
    groupId,
    userId,
    content,
    referenceType,
    referenceId
  );

  return reply
    .code(201)
    .send(message satisfies typeof PostMessageResponse.static);
}
