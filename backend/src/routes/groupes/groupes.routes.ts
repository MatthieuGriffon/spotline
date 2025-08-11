import type { FastifyInstance } from "fastify";
import { requireAuth } from "@/middlewares/requireAuth";
import { groupMemberGuard, groupAdminGuard } from "@/middlewares/groupGuards";
import * as S from "@/schemas/group/groups.schema";
import { GroupController } from "@/controllers/groupes/groupes.controller";

export default async function groupesRoutes(fastify: FastifyInstance) {
  const isMember = groupMemberGuard("id");
  const isAdmin = groupAdminGuard("id");

  // Auth de base
  fastify.get("/", { preHandler: [requireAuth] }, GroupController.list);
  fastify.post(
    "/",
    { preHandler: [requireAuth], schema: { body: S.CreateGroupBody } },
    GroupController.create
  );

  // Accès membre requis
  fastify.get(
    "/:id",
    { preHandler: [requireAuth, isMember], schema: { params: S.GroupParams } },
    GroupController.detail
  );
  fastify.post(
    "/:id/leave",
    { preHandler: [requireAuth, isMember], schema: { params: S.GroupParams } },
    GroupController.leave
  );

  // Accès admin requis
  fastify.put(
    "/:id",
    {
      preHandler: [requireAuth, isAdmin],
      schema: { params: S.GroupParams, body: S.UpdateGroupBody },
    },
    GroupController.update
  );
  fastify.post(
    "/:id/inviter",
    {
      preHandler: [requireAuth, isAdmin],
      schema: { params: S.GroupParams, body: S.InviteUserBody },
    },
    GroupController.invite
  );
  fastify.put(
    "/:id/membres/:userId",
    {
      preHandler: [requireAuth, isAdmin],
      schema: { params: S.MemberParams, body: S.ChangeRoleBody },
    },
    GroupController.changeRole
  );
  fastify.delete(
    "/:id/membres/:userId",
    { preHandler: [requireAuth, isAdmin], schema: { params: S.MemberParams } },
    GroupController.removeMember
  );
  fastify.delete(
    "/:id",
    { preHandler: [requireAuth, isAdmin], schema: { params: S.GroupParams } },
    GroupController.delete
  );
}
