import { Type } from '@sinclair/typebox'

export const ChangePasswordBody = Type.Object({
  oldPassword: Type.String({ minLength: 6 }),
  newPassword: Type.String({ minLength: 6 }),
})