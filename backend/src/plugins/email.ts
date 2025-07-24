import fp from 'fastify-plugin'

export default fp(async (fastify) => {
  fastify.decorate('email', {
    async sendConfirmationEmail(email: string, token: string) {
      console.log(`[DEV] Envoi email à ${email} avec token ${token}`)
      // en prod tu utiliseras Resend ici
    },
  })
})