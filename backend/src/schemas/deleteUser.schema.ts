import { Type } from '@sinclair/typebox'

export const DeleteUserParams = Type.Object({
  id: Type.Optional(Type.String()) // utilisé uniquement pour la route admin
})