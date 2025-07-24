import { Type } from '@sinclair/typebox'

export const logoutRouteSchema = {
  description: 'Déconnexion de l’utilisateur',
  response: {
    200: Type.Object({
      message: Type.String(),
    }),
  },
}