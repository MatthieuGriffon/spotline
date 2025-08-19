import { FastifyInstance } from "fastify";
import { WebSocket } from "ws";
import * as chatService from "@/services/chat/chat.service";

// Dictionnaire global des connexions
const groupsSockets: Record<string, Set<WebSocket>> = {};

export default async function chatWsRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/groupes/:id/chat",
    { websocket: true },
    async (socket: WebSocket, req) => {
      const groupId = (req.params as { id: string }).id;
      const user = req.session.user;

      if (!user) {
        socket.send(
          JSON.stringify({ type: "error", message: "Non authentifié" })
        );
        socket.close();
        return;
      }

      // Initialise le Set pour ce groupe si besoin
      if (!groupsSockets[groupId]) {
        groupsSockets[groupId] = new Set();
      }
      groupsSockets[groupId].add(socket);

      fastify.log.info(
        `[WS] User ${user.pseudo} connecté au groupe ${groupId}`
      );

      // 🔹 Réception d'un message
      socket.on("message", async (raw) => {
        try {
          const { content, referenceType, referenceId } = JSON.parse(
            raw.toString()
          );

          const saved = await chatService.createMessage(
            fastify,
            groupId,
            user.id,
            content,
            referenceType,
            referenceId
          );

          // Broadcast
          for (const client of groupsSockets[groupId]) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(saved));
            }
          }
        } catch (err) {
          fastify.log.error(err);
          socket.send(
            JSON.stringify({ type: "error", message: "Format invalide" })
          );
        }
      });

      // 🔹 Nettoyage
      socket.on("close", () => {
        groupsSockets[groupId].delete(socket);
        if (groupsSockets[groupId].size === 0) {
          delete groupsSockets[groupId];
        }
        fastify.log.info(
          `[WS] User ${user.pseudo} déconnecté du groupe ${groupId}`
        );
      });
    }
  );
}
