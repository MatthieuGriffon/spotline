import type { Message, User } from "@prisma/client";

export function mapMessageToResponse(
  msg: Message & { user: Pick<User, "id" | "pseudo" | "imageUrl"> }
) {
  return {
    id: msg.id,
    content: msg.content,
    createdAt: msg.createdAt.toISOString(),
    user: {
      id: msg.user.id,
      pseudo: msg.user.pseudo,
      imageUrl: msg.user.imageUrl ?? undefined,
    },
    referenceType: msg.referenceType,
    referenceId: msg.referenceId,
  };
}
