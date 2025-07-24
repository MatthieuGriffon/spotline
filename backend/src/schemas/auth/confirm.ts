import { Type } from '@sinclair/typebox'

export const confirmParamsSchema = Type.Object({
  token: Type.String({ minLength: 10 }), // UUID ou autre jeton
})
export const confirmEmailRouteSchema = {
  description: 'Confirme un email via token',
  params: confirmParamsSchema,
  response: {
    200: Type.Object({
      message: Type.String(),
    }),
  },
}