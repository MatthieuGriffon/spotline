import { FastifyInstance, FastifyRequest } from 'fastify'


export async function getReportedPrises(fastify: FastifyInstance) {
  const reports = await fastify.prisma.report.findMany({
    where: {
      type: 'PRISE',
      resolved: false,
      prise: { isNot: null } // ✅ Sécurisation des relations manquantes
    },
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

  const result = reports
    .filter(r => r.prise) // 🔐 Sécurité supplémentaire
    .map(report => {
      const prise = report.prise!
      const msgList = prise.reports.map(r => r.message).filter(Boolean)

      return {
        id: report.id,
        priseId: prise.id,
        user: {
          id: prise.user.id,
          pseudo: prise.user.pseudo
        },
        groupName: prise.group?.name || null,
        date: prise.date.toISOString(),
        photoUrl: prise.photoUrl,
        description: prise.description || null,
        signalementId: report.id,
        reportsCount: countsMap[prise.id] || 1,
        reports: msgList
      }
    })

  console.log('✅ [DEBUG] final result:', JSON.stringify(result, null, 2))
  return result
}


export async function moderatePrise(
  request: FastifyRequest<{ Params: { priseId: string } }>,
  action: 'mask' | 'delete' | 'ignore'
) {
  const fastify = request.server
  const adminId = request.session?.user?.id
  const priseId = request.params.priseId

  if (!adminId) {
    throw fastify.httpErrors.unauthorized('Admin non authentifié')
  }

  let prise = await fastify.prisma.prise.findUnique({
    where: { id: priseId },
    include: { user: true }
  })

  if (!prise && action !== 'delete') {
    throw fastify.httpErrors.notFound('Prise introuvable')
  }

  switch (action) {
    case 'mask':
      await fastify.prisma.prise.update({
        where: { id: priseId },
        data: { visibility: 'private' }
      })
      break

    case 'delete':
      await fastify.prisma.report.deleteMany({ where: { priseId } })
      await fastify.prisma.moderationLog.deleteMany({ where: { priseId } })
      await fastify.prisma.prise.delete({ where: { id: priseId } })
      break

    case 'ignore':
      // Pas de modification directe sur la prise
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

  // Ne log que si la prise n’a pas été supprimée
  if (action !== 'delete') {
    await fastify.prisma.moderationLog.create({
  data: {
    action,
    adminId,
    priseId,
    priseEspece: prise?.espece,
    userPseudo: prise?.user.pseudo
  }
})
  }

  return { message: `Prise ${action} avec succès.` }
}