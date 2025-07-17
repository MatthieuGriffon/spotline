import Fastify from 'fastify'

const app = Fastify({
  logger: true
})

app.get('/ping', async () => {
  return { message: 'Spotline backend is alive 🐟' }
})

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  app.log.info(`🚀 Spotline server listening at ${address}`)
})