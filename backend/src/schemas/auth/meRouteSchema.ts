import { Type } from '@sinclair/typebox'

export const meRouteSchema = {
  description: "Renvoie les infos de l’utilisateur connecté",
  response: {
    200: Type.Object({
      id: Type.String(),
      email: Type.String(),
      pseudo: Type.String(),
      role: Type.String(),
      imageUrl: Type.Optional(Type.Union([Type.String(), Type.Null()])),
      isConfirmed: Type.Optional(Type.Boolean()), // ← rend ce champ optionnel
    }),
  },
};