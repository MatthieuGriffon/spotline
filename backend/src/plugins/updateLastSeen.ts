import { FastifyInstance } from 'fastify'

export async function updateLastSeenPlugin(fastify: FastifyInstance) {
  fastify.addHook('onRequest', async (request) => {
    const sessionId = request.session.accountSessionId

    if (sessionId) {
      try {
        await fastify.prisma.accountSession.update({
          where: { id: sessionId },
          data: { lastSeen: new Date() }
        })
      } catch (err) {
        fastify.log.warn(`Erreur update lastSeen pour session ${sessionId} : ${err}`)
      }
    }
  })
}