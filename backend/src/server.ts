import Fastify from 'fastify'
import * as dotenv from 'dotenv'
import prismaPlugin from './plugins/prisma'
import emailPlugin from './plugins/email'
import sensible from '@fastify/sensible'

dotenv.config()
const app = Fastify({
  logger: true
})

// Register plugins
app.register(prismaPlugin)
app.register(emailPlugin)
app.register(sensible)


// Register routes
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