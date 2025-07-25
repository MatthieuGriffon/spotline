import { Type } from '@sinclair/typebox'

export const UpdatePseudoBody = Type.Object({
  pseudo: Type.String({ minLength: 2, maxLength: 32 })
})