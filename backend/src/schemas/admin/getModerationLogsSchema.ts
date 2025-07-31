import { Type } from '@sinclair/typebox'

export const getModerationLogsSchema = {
  tags: ['admin'],
  summary: 'Lister les logs de modération',
  response: {
    200: Type.Array(
      Type.Object({
        id: Type.String(),
        action: Type.Union([
          Type.Literal('mask'),
          Type.Literal('delete'),
          Type.Literal('ignore')
        ]),
        createdAt: Type.String({ format: 'date-time' }),
        priseId: Type.String(),
        espece: Type.String(),
        pseudo: Type.String(),
        adminPseudo: Type.String()
      })
    )
  }
}
