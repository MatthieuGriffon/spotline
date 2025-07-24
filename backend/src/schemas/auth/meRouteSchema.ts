import { Type } from '@sinclair/typebox'

export const meRouteSchema = {
  description: 'Renvoie les infos de l’utilisateur connecté',
  response: {
    200: Type.Object({
      id: Type.String(),
      email: Type.String({ format: 'email' }),
      pseudo: Type.String(),
      role: Type.Union([Type.Literal('USER'), Type.Literal('ADMIN')]),
    }),
  },
}