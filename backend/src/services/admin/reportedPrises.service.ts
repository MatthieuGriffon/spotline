import { FastifyInstance } from 'fastify'


export async function getReportedPrises(fastify: FastifyInstance) {
  const reports = await fastify.prisma.report.findMany({
    where: { type: 'PRISE', resolved: false },
    include: {
      prise: {
        include: {
          user: true,
          group: true,
          reports: {
            where: { resolved: false },
            select: { message: true }
          }
        }
      }
    }
  })

  const grouped = await fastify.prisma.report.groupBy({
    by: ['priseId'],
    where: { type: 'PRISE', resolved: false },
    _count: true
  })

  const countsMap = Object.fromEntries(
    grouped.map(r => [r.priseId, r._count])
  )

  const result = reports.map(report => {
    const msgList = report.prise?.reports.map(r => r.message).filter(Boolean) || []

    console.log('🔁 [DEBUG] mapping report id:', report.id)
    console.log('📨 messages:', msgList)

    return {
      id: report.id,
      priseId: report.prise?.id!,
      user: {
        id: report.prise?.user.id!,
        pseudo: report.prise?.user.pseudo!
      },
      groupName: report.prise?.group?.name || null,
      date: report.prise?.date.toISOString(),
      photoUrl: report.prise?.photoUrl!,
      description: report.prise?.description || null,
      signalementId: report.id,
      reportsCount: countsMap[report.prise?.id || ''] || 1,
      reports: msgList // ← 🔥 enfin inclus proprement
    }
  })

  console.log('✅ [DEBUG] final result:', JSON.stringify(result, null, 2))
  return result
}


export async function moderatePrise(
  fastify: FastifyInstance,
  priseId: string,
  action: 'mask' | 'delete' | 'ignore'
) {
  switch (action) {
    case 'mask':
      await fastify.prisma.prise.update({
        where: { id: priseId },
        data: { visibility: 'private' }
      })
      break

    case 'delete':
      await fastify.prisma.prise.delete({
        where: { id: priseId }
      })
      break

    case 'ignore':
      break

    default:
      throw fastify.httpErrors.badRequest('Action inconnue')
  }

  await fastify.prisma.report.updateMany({
    where: {
      priseId,
      type: 'PRISE',
      resolved: false
    },
    data: { resolved: true }
  })
}