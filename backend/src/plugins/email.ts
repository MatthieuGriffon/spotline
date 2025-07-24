import fp from 'fastify-plugin'

export default fp(async (fastify) => {
  fastify.decorate('email', {
    async sendConfirmationEmail(
      email: string,
      token: string,
      subject?: string,
      body?: string
    ) {
      // En dev on loggue l'email
      console.log(`[DEV] Envoi email à ${email}`)
      console.log(`     Sujet: ${subject ?? 'Confirmation Spotline'}`)
      console.log(`     Corps: ${body ?? `Voici votre token : ${token}`}`)
    },
  })
})