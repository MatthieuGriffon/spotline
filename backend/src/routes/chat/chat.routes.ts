import { FastifyInstance } from "fastify";
import { getMessages, postMessage } from "@/controllers/chat/chat.controller";
import {
  GetMessagesQuery,
  GetMessagesResponse,
  PostMessageBody,
  PostMessageResponse,
} from "@/schemas/chat/chat.schema";
import { requireAuth } from "@/middlewares/requireAuth";
import { groupMemberGuard } from "@/middlewares/groupGuards";

export default async function chatRoutes(fastify: FastifyInstance) {
  // ------------------------------
  // GET /groups/:id/messages
  // ------------------------------
  fastify.route({
    method: "GET",
    url: "/groupes/:id/messages",
    preHandler: [requireAuth, groupMemberGuard("id")],
    schema: {
      querystring: GetMessagesQuery,
      response: {
        200: GetMessagesResponse,
      },
    },
    handler: getMessages,
  });

  // ------------------------------
  // POST /groups/:id/messages
  // ------------------------------
  fastify.route({
    method: "POST",
    url: "/groupes/:id/messages",
    preHandler: [requireAuth, groupMemberGuard("id")],
    schema: {
      body: PostMessageBody,
      response: {
        201: PostMessageResponse,
      },
    },
    handler: postMessage,
  });
}
