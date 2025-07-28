import { FastifyInstance } from 'fastify'

export async function getReportedPrises(fastify: FastifyInstance) {
  const reports = await fastify.prisma.report.findMany({
    where: { type: 'PRISE', resolved: false },
    include: {
      prise: {
        include: {
          user: true,
          group: true
        }
      }
    }
  })

  return reports.map(report => ({
    id: report.id,
    priseId: report.prise?.id,
    user: {
      id: report.prise?.user.id,
      pseudo: report.prise?.user.pseudo
    },
    group: report.prise?.group?.name || null,
    date: report.prise?.date,
    photoUrl: report.prise?.photoUrl,
    description: report.prise?.description,
    signalementId: report.id
  }))
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