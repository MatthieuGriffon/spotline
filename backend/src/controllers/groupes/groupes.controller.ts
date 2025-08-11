import type { FastifyRequest, FastifyReply } from "fastify";
import * as S from "@/schemas/group/groups.schema";
import {
  listMyGroups,
  createGroup,
  getGroup,
  updateGroup,
  inviteUser,
  changeRole,
  removeMember,
  leaveGroup,
  deleteGroup,
} from "@/services/groupes/groupes.services";

export const GroupController = {
  list: async (req: FastifyRequest, rep: FastifyReply) => {
    const userId = (req.session as any).user.id;
    const data = await listMyGroups(req.server, userId);
    rep.send(data);
  },
  create: async (
    req: FastifyRequest<{ Body: typeof S.CreateGroupBody.static }>,
    rep: FastifyReply
  ) => {
    const userId = (req.session as any).user.id;
    const group = await createGroup(req.server, userId, req.body);
    rep.code(201).send(group);
  },
  detail: async (
    req: FastifyRequest<{ Params: typeof S.GroupParams.static }>,
    rep: FastifyReply
  ) => {
    const userId = (req.session as any).user.id;
    const group = await getGroup(req.server, userId, req.params.id);
    rep.send(group);
  },
  update: async (
    req: FastifyRequest<{
      Params: typeof S.GroupParams.static;
      Body: typeof S.UpdateGroupBody.static;
    }>,
    rep: FastifyReply
  ) => {
    const userId = (req.session as any).user.id;
    const g = await updateGroup(req.server, userId, req.params.id, req.body);
    rep.send(g);
  },
  invite: async (
    req: FastifyRequest<{
      Params: typeof S.GroupParams.static;
      Body: typeof S.InviteUserBody.static;
    }>,
    rep: FastifyReply
  ) => {
    const userId = (req.session as any).user.id;
    const gm = await inviteUser(req.server, userId, req.params.id, req.body);
    rep.code(201).send(gm);
  },
  changeRole: async (
    req: FastifyRequest<{
      Params: typeof S.MemberParams.static;
      Body: typeof S.ChangeRoleBody.static;
    }>,
    rep: FastifyReply
  ) => {
    const userId = (req.session as any).user.id;
    const gm = await changeRole(
      req.server,
      userId,
      req.params.id,
      req.params.userId,
      req.body.role
    );
    rep.send(gm);
  },
  removeMember: async (
    req: FastifyRequest<{ Params: typeof S.MemberParams.static }>,
    rep: FastifyReply
  ) => {
    const userId = (req.session as any).user.id;
    await removeMember(req.server, userId, req.params.id, req.params.userId);
    rep.code(204).send();
  },
  leave: async (
    req: FastifyRequest<{ Params: typeof S.GroupParams.static }>,
    rep: FastifyReply
  ) => {
    const userId = (req.session as any).user.id;
    await leaveGroup(req.server, userId, req.params.id);
    rep.code(204).send();
  },
  delete: async (
    req: FastifyRequest<{ Params: typeof S.GroupParams.static }>,
    rep: FastifyReply
  ) => {
    const userId = (req.session as any).user.id;
    await deleteGroup(req.server, userId, req.params.id);
    rep.code(204).send();
  },
};
