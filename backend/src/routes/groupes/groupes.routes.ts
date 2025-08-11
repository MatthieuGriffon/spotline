import type { FastifyInstance } from "fastify";
import type { Static } from "@sinclair/typebox";

import { requireAuth } from "@/middlewares/requireAuth";
import { groupMemberGuard, groupAdminGuard } from "@/middlewares/groupGuards";
import * as S from "@/schemas/group/groups.schema";
import { GroupController } from "@/controllers/groupes/groupes.controller";
import { GroupListResponse } from "@/schemas/group/groupList.schema";
import { getMyGroups } from "@/services/groupes/groupes.services";

export default async function groupesRoutes(fastify: FastifyInstance) {
  const isMember = groupMemberGuard("id");
  const isAdmin = groupAdminGuard("id");

  // 📌 Lister les groupes de l'utilisateur
  fastify.get(
    "/",
    {
      preHandler: [requireAuth],
      schema: {
        tags: ["Groupes"],
        summary: "Lister mes groupes",
        description:
          "Retourne la liste des groupes auxquels l'utilisateur est membre.",
        response: {
          200: S.GroupListResponse,
          401: S.ErrorResponse,
        },
      },
    },
    GroupController.list
  );

  // 📌 Créer un groupe
  fastify.post<{ Body: Static<typeof S.CreateGroupBody> }>(
    "/",
    {
      preHandler: [requireAuth],
      schema: {
        tags: ["Groupes"],
        summary: "Créer un groupe",
        description:
          "Permet à un utilisateur authentifié de créer un nouveau groupe.",
        body: S.CreateGroupBody,
        response: {
          201: S.GroupDetailResponse,
          400: S.ErrorResponse,
          401: S.ErrorResponse,
        },
      },
    },
    GroupController.create
  );

  // 📌 Détails d'un groupe
  fastify.get<{ Params: Static<typeof S.GroupParams> }>(
    "/:id",
    {
      preHandler: [requireAuth, isMember],
      schema: {
        tags: ["Groupes"],
        summary: "Détails d'un groupe",
        description:
          "Retourne les informations détaillées d'un groupe spécifique.",
        params: S.GroupParams,
        response: {
          200: S.GroupDetailResponse,
          401: S.ErrorResponse,
          403: S.ErrorResponse,
          404: S.ErrorResponse,
        },
      },
    },
    GroupController.detail
  );

  // 📌 Quitter un groupe
  fastify.post<{ Params: Static<typeof S.GroupParams> }>(
    "/:id/leave",
    {
      preHandler: [requireAuth, isMember],
      schema: {
        tags: ["Groupes"],
        summary: "Quitter un groupe",
        description: "Permet à un membre de quitter un groupe.",
        params: S.GroupParams,
        response: {
          200: S.SuccessResponse,
          401: S.ErrorResponse,
          403: S.ErrorResponse,
        },
      },
    },
    GroupController.leave
  );

  // 📌 Mettre à jour un groupe
  fastify.put<{
    Params: Static<typeof S.GroupParams>;
    Body: Static<typeof S.UpdateGroupBody>;
  }>(
    "/:id",
    {
      preHandler: [requireAuth, isAdmin],
      schema: {
        tags: ["Groupes"],
        summary: "Mettre à jour un groupe",
        description:
          "Permet à un administrateur de groupe de modifier ses informations.",
        params: S.GroupParams,
        body: S.UpdateGroupBody,
        response: {
          200: S.GroupDetailResponse,
          400: S.ErrorResponse,
          401: S.ErrorResponse,
          403: S.ErrorResponse,
        },
      },
    },
    GroupController.update
  );

  // 📌 Inviter un utilisateur dans un groupe
  fastify.post<{
    Params: Static<typeof S.GroupParams>;
    Body: Static<typeof S.InviteUserBody>;
  }>(
    "/:id/inviter",
    {
      preHandler: [requireAuth, isAdmin],
      schema: {
        tags: ["Groupes"],
        summary: "Inviter un utilisateur",
        description:
          "Permet à un administrateur d'inviter un utilisateur à rejoindre le groupe.",
        params: S.GroupParams,
        body: S.InviteUserBody,
        response: {
          200: S.SuccessResponse,
          400: S.ErrorResponse,
          401: S.ErrorResponse,
          403: S.ErrorResponse,
        },
      },
    },
    GroupController.invite
  );

  // 📌 Changer le rôle d'un membre
  fastify.put<{
    Params: Static<typeof S.MemberParams>;
    Body: Static<typeof S.ChangeRoleBody>;
  }>(
    "/:id/membres/:userId",
    {
      preHandler: [requireAuth, isAdmin],
      schema: {
        tags: ["Groupes"],
        summary: "Changer le rôle d'un membre",
        description:
          "Modifie le rôle d'un membre dans un groupe (ex: admin, membre, invité).",
        params: S.MemberParams,
        body: S.ChangeRoleBody,
        response: {
          200: S.SuccessResponse,
          400: S.ErrorResponse,
          401: S.ErrorResponse,
          403: S.ErrorResponse,
        },
      },
    },
    GroupController.changeRole
  );

  // 📌 Retirer un membre d'un groupe
  fastify.delete<{ Params: Static<typeof S.MemberParams> }>(
    "/:id/membres/:userId",
    {
      preHandler: [requireAuth, isAdmin],
      schema: {
        tags: ["Groupes"],
        summary: "Retirer un membre",
        description: "Supprime un membre du groupe.",
        params: S.MemberParams,
        response: {
          200: S.SuccessResponse,
          401: S.ErrorResponse,
          403: S.ErrorResponse,
        },
      },
    },
    GroupController.removeMember
  );

  // 📌 Supprimer un groupe
  fastify.delete<{ Params: Static<typeof S.GroupParams> }>(
    "/:id",
    {
      preHandler: [requireAuth, isAdmin],
      schema: {
        tags: ["Groupes"],
        summary: "Supprimer un groupe",
        description: "Permet à un administrateur de supprimer un groupe.",
        params: S.GroupParams,
        response: {
          200: S.SuccessResponse,
          401: S.ErrorResponse,
          403: S.ErrorResponse,
        },
      },
    },
    GroupController.delete
  );

   fastify.get(
     "/groupes",
     {
       schema: {
         response: {
           200: GroupListResponse,
         },
       },
     },
     async (request) => {
       const user = request.session.user;
       if (!user) {
         return fastify.httpErrors.unauthorized("Non authentifié");
       }

       return getMyGroups(fastify, user.id);
     }
   );
}
