import { Type } from '@sinclair/typebox'

export const UpdateUserByAdminBody = Type.Object({
  pseudo: Type.String({ minLength: 2 }),
  role: Type.Union([
    Type.Literal('USER'),
    Type.Literal('ADMIN')
  ]),
  isBanned: Type.Boolean()
})

export const UserAdminResponse = Type.Object({
  id: Type.String(),
  pseudo: Type.String(),
  email: Type.String(),
  role: Type.String(),
  isBanned: Type.Boolean(),
  isConfirmed: Type.Optional(Type.Boolean())
})

export const UserAdminArrayResponse = Type.Array(UserAdminResponse)