import type { FastifyRequest, FastifyReply } from "fastify";

type ParamGetter = (req: FastifyRequest) => string | undefined;

function readParam(paramName = "id"): ParamGetter {
  return (req) => (req.params as any)?.[paramName];
}

export function groupMemberGuard(paramName = "id") {
  const getGroupId = readParam(paramName);
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.session?.user;
    const groupId = getGroupId(request);
    if (!user || !groupId)
      return reply.code(400).send({ error: "Requête invalide" });

    const member = await request.server.prisma.groupMember.findUnique({
      where: { userId_groupId: { userId: user.id, groupId } },
      select: { userId: true, groupId: true, role: true, joinedAt: true },
    });
    if (!member) return reply.code(403).send({ error: "Accès groupe refusé" });

    request.groupMember = member;
  };
}

export function groupAdminGuard(paramName = "id") {
  const getGroupId = readParam(paramName);
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.session?.user;
    const groupId = getGroupId(request);
    if (!user || !groupId)
      return reply.code(400).send({ error: "Requête invalide" });

    const cached = request.groupMember;
    if (cached && cached.role === "admin") return;

    const member =
      cached ??
      (await request.server.prisma.groupMember.findUnique({
        where: { userId_groupId: { userId: user.id, groupId } },
        select: { role: true },
      }));

    if (!member || member.role !== "admin") {
      return reply.code(403).send({ error: "Admin du groupe requis" });
    }

    request.groupMember = {
      ...(request.groupMember || ({} as any)),
      role: "admin",
    };
  };
}
