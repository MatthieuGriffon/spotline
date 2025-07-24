import fp from 'fastify-plugin'
import { Resend } from 'resend'

export default fp(async (fastify) => {
  const resend = new Resend(process.env.RESEND_API_KEY)
  fastify.decorate('email', {
    async sendMail({
      to,
      subject,
      html
    }: {
      to: string,
      subject: string,
      html: string
    }) {
      try {
        const res = await resend.emails.send({
          from: 'Spotline <no-reply@spotline.fr>', // <-- ICI le bon domaine validé
          to: [to],
          subject,
          html,
        })
        console.log('RESEND RES:', res);
        console.log('RESEND DATA:', res.data);
        console.log('RESEND ERROR:', res.error);
        if (res.data?.id) {
          fastify.log.info(`[RESEND] Email envoyé à ${to} (id: ${res.data.id})`)
        } else if (res.error) {
          fastify.log.error('[RESEND] Erreur envoi email:', res.error)
          throw fastify.httpErrors.internalServerError('Erreur Resend : ' + res.error.message)
        }
      } catch (err) {
        fastify.log.error('[RESEND] Erreur envoi email:', err);
        console.error('⛔️ RESEND RAW ERROR:', err);
        if (err instanceof Error && (err as any).response) {
          console.error('⛔️ RESEND RESPONSE:', await (err as any).response.text());
          console.error('⛔️ RESEND FULL:', JSON.stringify(err, null, 2));
        }
        if (
          err &&
          typeof err === 'object' &&
          'response' in err &&
          err.response &&
          typeof (err as any).response.text === 'function'
        ) {
          (err as any).response.text().then(console.error);
        }
        throw fastify.httpErrors.internalServerError('Impossible d\'envoyer l\'email');
      }
    },
  })
})