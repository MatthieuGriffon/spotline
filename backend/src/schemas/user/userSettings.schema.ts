import { Type } from '@sinclair/typebox'

export const UserSettingsBody = Type.Partial(
  Type.Object({
    darkMode: Type.Boolean(),
    mapTile: Type.String({ minLength: 1 }),
    notifications: Type.Boolean()
  })
)

export const UserSettingsResponse = Type.Object({
  message: Type.String()
})