import { FastifyInstance } from 'fastify'

export async function getModerationLogs(fastify: FastifyInstance) {
  const logs = await fastify.prisma.moderationLog.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      prise: {
        select: {
          id: true,
          espece: true,
          user: {
            select: {
              pseudo: true
            }
          }
        }
      },
      admin: {
        select: {
          pseudo: true
        }
      }
    }
  })

  return logs.map(log => ({
    id: log.id,
    action: log.action,
    createdAt: log.createdAt.toISOString(),
    priseId: log.priseId,
    espece: log.prise?.espece ?? log.priseEspece ?? '—',
    pseudo: log.prise?.user.pseudo ?? log.userPseudo ?? '—',
    adminPseudo: log.admin.pseudo
  }))
}  