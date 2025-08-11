export type AdminStats = {
  utilisateurs: { total: number; bannis: number }
  prises: { total: number; signalees: number }
  spots: { total: number; masques: number }
  signalements: number
}
