import type { FastifyRequest, FastifyReply } from "fastify";
import * as S from "@/schemas/group/groups.schema";
import {
  getMyGroups,
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
  // 📋 Lister mes groupes
  async list(req: FastifyRequest) {
    const user = req.session.user;
    if (!user) {
      throw req.server.httpErrors.unauthorized("Non authentifié");
    }
    return getMyGroups(req.server, user.id);
  },

  // ➕ Créer un groupe
  async create(
    req: FastifyRequest<{ Body: typeof S.CreateGroupBody.static }>,
    rep: FastifyReply
  ) {
    const user = req.session.user;
    if (!user) {
      throw req.server.httpErrors.unauthorized("Non authentifié");
    }
    const group = await createGroup(req.server, user.id, req.body);
    rep.code(201).send(group);
  },

  // 📄 Détails d'un groupe
  async detail(req: FastifyRequest<{ Params: typeof S.GroupParams.static }>) {
    const user = req.session.user;
    if (!user) {
      throw req.server.httpErrors.unauthorized("Non authentifié");
    }
    return getGroup(req.server, user.id, req.params.id);
  },

  // ✏️ Mettre à jour un groupe
  async update(
    req: FastifyRequest<{
      Params: typeof S.GroupParams.static;
      Body: typeof S.UpdateGroupBody.static;
    }>
  ) {
    const user = req.session.user;
    if (!user) {
      throw req.server.httpErrors.unauthorized("Non authentifié");
    }
    return updateGroup(req.server, user.id, req.params.id, req.body);
  },

  // 📩 Inviter un utilisateur
  async invite(
    req: FastifyRequest<{
      Params: typeof S.GroupParams.static;
      Body: typeof S.InviteUserBody.static;
    }>,
    rep: FastifyReply
  ) {
    const user = req.session.user;
    if (!user) {
      throw req.server.httpErrors.unauthorized("Non authentifié");
    }
    const gm = await inviteUser(req.server, user.id, req.params.id, req.body);
    rep.code(201).send(gm);
  },

  // 🔄 Changer le rôle d'un membre
  async changeRole(
    req: FastifyRequest<{
      Params: typeof S.MemberParams.static;
      Body: typeof S.ChangeRoleBody.static;
    }>
  ) {
    const user = req.session.user;
    if (!user) {
      throw req.server.httpErrors.unauthorized("Non authentifié");
    }
    return changeRole(
      req.server,
      user.id,
      req.params.id,
      req.params.userId,
      req.body.role
    );
  },

  // ❌ Retirer un membre
  async removeMember(
    req: FastifyRequest<{ Params: typeof S.MemberParams.static }>,
    rep: FastifyReply
  ) {
    const user = req.session.user;
    if (!user) {
      throw req.server.httpErrors.unauthorized("Non authentifié");
    }
    await removeMember(req.server, user.id, req.params.id, req.params.userId);
    rep.send({ success: true, message: "Groupe supprimé" });
  },

  // 🚪 Quitter un groupe
  async leave(
    req: FastifyRequest<{ Params: typeof S.GroupParams.static }>,
    rep: FastifyReply
  ) {
    const user = req.session.user;
    if (!user) {
      throw req.server.httpErrors.unauthorized("Non authentifié");
    }
    await leaveGroup(req.server, user.id, req.params.id);
    rep.send({ success: true, message: "Vous avez quitté le groupe" });
  },

  // 🗑 Supprimer un groupe
  async delete(
    req: FastifyRequest<{ Params: typeof S.GroupParams.static }>,
    rep: FastifyReply
  ) {
    const user = req.session.user;
    if (!user) {
      throw req.server.httpErrors.unauthorized("Non authentifié");
    }
    await deleteGroup(req.server, user.id, req.params.id);
    rep.send({ success: true, message: "Groupe supprimé" });
  },
};
