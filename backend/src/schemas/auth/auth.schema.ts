import { Type } from '@sinclair/typebox'

export const RegisterBody = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 8 }),
  pseudo: Type.String({ minLength: 2, maxLength: 30 }),
})