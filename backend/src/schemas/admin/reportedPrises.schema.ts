import { Type } from '@sinclair/typebox'

export const getReportedPrisesSchema = {
  tags: ['admin'],
  summary: 'Lister toutes les prises signalées',
  response: {
    200: Type.Array(
      Type.Object({
        id: Type.String(),
        priseId: Type.String(),
        user: Type.Object({
          id: Type.String(),
          pseudo: Type.String()
        }),
        groupName: Type.Union([Type.String(), Type.Null()]),
        date: Type.String(),
        photoUrl: Type.String(),
        description: Type.Union([Type.String(), Type.Null()]),
        signalementId: Type.String(),
        reportsCount: Type.Number(),
        reports: Type.Array(Type.String())
      })
    )
  }
}

export const moderatePriseSchema = {
  tags: ['admin'],
  summary: 'Modérer une prise signalée',
  params: Type.Object({
    priseId: Type.String()
  }),
  body: Type.Object({
    action: Type.Union([
      Type.Literal('mask'),
      Type.Literal('delete'),
      Type.Literal('ignore')
    ])
  }),
  response: {
    200: Type.Object({
      message: Type.String()
    })
  }
}