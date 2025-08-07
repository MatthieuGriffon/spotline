import { Static, Type } from '@sinclair/typebox'

export const UserDashboardResponse = Type.Object({
  user: Type.Object({
    pseudo: Type.String(),
    imageUrl: Type.Optional(Type.String()),
    isConfirmed: Type.Boolean()
  }),

  recentGroups: Type.Array(
    Type.Object({
      id: Type.String(),
      name: Type.String(),
      role: Type.Union([
        Type.Literal('admin'),
        Type.Literal('member'),
        Type.Literal('guest')
      ]),
      memberCount: Type.Number()
    })
  ),

  recentPrises: Type.Array(
    Type.Object({
      id: Type.String(),
      photoUrl: Type.String(),
      espece: Type.String(),
      date: Type.String({ format: 'date-time' }),
      groupName: Type.Optional(Type.String())
    })
  ),

  recentSessions: Type.Array(
    Type.Object({
      id: Type.String(),
      title: Type.String(),
      date: Type.String({ format: 'date-time' }),
      role: Type.Union([
        Type.Literal('organizer'),
        Type.Literal('invited')
      ]),
      response: Type.Optional(
        Type.Union([
          Type.Literal('yes'),
          Type.Literal('no'),
          Type.Literal('maybe'),
          Type.Null()
        ])
      ),
      responsesSummary: Type.Optional(
        Type.Object({
          yes: Type.Number(),
          no: Type.Number(),
          maybe: Type.Number()
        })
      )
    })
  ),

  stats: Type.Optional(
    Type.Object({
      prisesCount: Type.Number(),
      groupsCount: Type.Number(),
      sessionsWaitingReply: Type.Number()
    })
  ),

  spotFavori: Type.Optional(
    Type.Object({
      id: Type.String(),
      name: Type.String(),
      latitude: Type.Number(),
      longitude: Type.Number()
    })
  ),

  message: Type.Optional(Type.String())
})

export type UserDashboardResponseType = Static<typeof UserDashboardResponse>