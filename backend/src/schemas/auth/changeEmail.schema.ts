import { Type } from '@sinclair/typebox'

export const ChangeEmailBody = Type.Object({
  newEmail: Type.String({ format: 'email' })
})