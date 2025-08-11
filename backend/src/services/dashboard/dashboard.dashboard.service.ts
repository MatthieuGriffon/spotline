import { FastifyInstance } from 'fastify'

export async function getUserDashboardData(fastify: FastifyInstance, userId: string) {
  const [user, recentGroups, recentPrises, sessionOrganized, sessionInvited, stats, unanswered] = await Promise.all([
    fastify.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        pseudo: true,
        imageUrl: true,
        isConfirmed: true
      }
    }),

    fastify.prisma.groupMember.findMany({
      where: { userId },
      orderBy: { joinedAt: 'desc' },
      take: 3,
      include: {
        group: {
          select: {
            id: true,
            name: true,
            members: { select: { id: true } }
          }
        }
      }
    }),

   fastify.prisma.prise.findMany({
  where: { userId },
  orderBy: { date: 'desc' },
  take: 3,
  include: {
    groupes: {
      include: {
        group: { select: { name: true } }
      }
    }
  }
}),

    fastify.prisma.session.findMany({
      where: { organizerId: userId },
      orderBy: { date: 'desc' },
      take: 3,
      include: {
        invites: true
      }
    }),

    fastify.prisma.sessionInvite.findMany({
      where: { userId },
      orderBy: { session: { date: 'desc' } },
      take: 3,
      include: {
        session: true
      }
    }),

    fastify.prisma.$transaction([
      fastify.prisma.prise.count({ where: { userId } }),
      fastify.prisma.groupMember.count({ where: { userId } }),
      fastify.prisma.sessionInvite.count({ where: { userId, response: null } })
    ]),

    fastify.prisma.sessionInvite.findMany({
      where: { userId, response: null },
      include: { session: true }
    })
  ])

  const recentGroupsFormatted = recentGroups.map(({ group, role }) => ({
    id: group.id,
    name: group.name,
    role,
    memberCount: group.members.length
  }))

 const recentPrisesFormatted = recentPrises.map((prise) => ({
   id: prise.id,
   photoUrl: prise.photoUrl,
   espece: prise.espece,
   date: prise.date.toISOString(),
   groupNames: prise.groupes.map((pg) => pg.group.name), // tableau de noms
 }));

  const recentSessionsOrganized = sessionOrganized.map(session => ({
    id: session.id,
    title: session.title,
    date: session.date.toISOString(),
    role: 'organizer' as const,
    responsesSummary: {
      yes: session.invites.filter(i => i.response === 'yes').length,
      no: session.invites.filter(i => i.response === 'no').length,
      maybe: session.invites.filter(i => i.response === 'maybe').length
    }
  }))

  const recentSessionsInvited = sessionInvited.map(invite => ({
    id: invite.session.id,
    title: invite.session.title,
    date: invite.session.date.toISOString(),
    role: 'invited' as const,
    response: invite.response ?? null
  }))

  const [prisesCount, groupsCount, sessionsWaitingReply] = stats

  return {
    user,
    recentGroups: recentGroupsFormatted,
    recentPrises: recentPrisesFormatted,
    recentSessions: [...recentSessionsOrganized, ...recentSessionsInvited]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3),
    stats: {
      prisesCount,
      groupsCount,
      sessionsWaitingReply
    },
    message: 'Heureux de te revoir sur Spotline 🎣'
  }
}