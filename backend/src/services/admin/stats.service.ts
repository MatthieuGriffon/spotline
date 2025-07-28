import { FastifyInstance } from 'fastify'

export async function getAdminDashboardStats(fastify: FastifyInstance) {
  const [
    totalUsers,
    bannisUsers,
    totalPrises,
    signaleesPrises,
    totalSpots,
    masquesSpots,
    signalementsActifs
  ] = await Promise.all([
    fastify.prisma.user.count(),
    fastify.prisma.user.count({ where: { isBanned: true } }),
    fastify.prisma.prise.count(),
    fastify.prisma.report.count({ where: { type: 'PRISE', resolved: false } }),
    fastify.prisma.spot.count(),
    fastify.prisma.spot.count({ where: { isHidden: true } }),
    fastify.prisma.report.count({ where: { resolved: false } }),
  ])

  return {
    utilisateurs: {
      total: totalUsers,
      bannis: bannisUsers
    },
    prises: {
      total: totalPrises,
      signalees: signaleesPrises
    },
    spots: {
      total: totalSpots,
      masques: masquesSpots
    },
    signalements: signalementsActifs
  }
}