import { Type } from '@sinclair/typebox'

export const AdminStatsResponse = Type.Object({
  utilisateurs: Type.Object({
    total: Type.Number(),
    bannis: Type.Number()
  }),
  prises: Type.Object({
    total: Type.Number(),
    signalees: Type.Number()
  }),
  spots: Type.Object({
    total: Type.Number(),
    masques: Type.Number()
  }),
  signalements: Type.Number()
})