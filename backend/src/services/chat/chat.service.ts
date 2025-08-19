import type { FastifyInstance } from "fastify";
import type { MessageReferenceType as PrismaMessageReferenceType } from "@prisma/client"; // ✅ enum Prisma
import { mapMessageToResponse } from "@/utils/chat";

// ------------------------------
// Récupérer les messages d’un groupe (avec pagination)
// ------------------------------
export async function getMessages(
  fastify: FastifyInstance,
  groupId: string,
  limit: number,
  offset: number
) {
  const [messages, total] = await Promise.all([
    fastify.prisma.message.findMany({
      where: { groupId },
      orderBy: { createdAt: "asc" },
      skip: offset,
      take: limit,
      include: {
        user: {
          select: { id: true, pseudo: true, imageUrl: true },
        },
      },
    }),
    fastify.prisma.message.count({ where: { groupId } }),
  ]);

  return {
    messages: messages.map(mapMessageToResponse), // ✅ mapping factorisé
    pagination: { limit, offset, total },
  };
}

// ------------------------------
// Créer un nouveau message
// ------------------------------
export async function createMessage(
  fastify: FastifyInstance,
  groupId: string,
  userId: string,
  content: string,
  referenceType?: PrismaMessageReferenceType | null,
  referenceId?: string | null
) {
  const message = await fastify.prisma.message.create({
    data: {
      groupId,
      userId,
      content,
      referenceType: referenceType ?? null,
      referenceId: referenceId ?? null,
    },
    include: {
      user: {
        select: { id: true, pseudo: true, imageUrl: true },
      },
    },
  });

  return mapMessageToResponse(message); // ✅ mapping factorisé
}
