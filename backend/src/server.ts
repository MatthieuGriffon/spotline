import Fastify from 'fastify'
import * as dotenv from 'dotenv'
import prismaPlugin from '@/plugins/prisma'
import emailPlugin from '@/plugins/email'
import sensible from '@fastify/sensible'
import authRoutes from '@/routes/auth'
import { initAdmin } from '@/scripts/init-admin'


dotenv.config()
const app = Fastify({
  logger: true
})
import fastifyCookie from '@fastify/cookie'
import fastifySession from '@fastify/session'
// Register plugins
app.register(fastifyCookie)

app.register(fastifySession, {
  secret: process.env.SESSION_SECRET || 'default_dev_secret_should_change',
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: 'lax',
  },
  saveUninitialized: false,
})



app.register(prismaPlugin)
app.register(emailPlugin)
app.register(sensible)

// Initialize admin user
app.ready().then(async () => {
  await initAdmin(app.prisma)
})

// Register routes
app.register(authRoutes, { prefix: '/api/auth' })

// listen on port 3000
app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  app.log.info(`🚀 Spotline server listening at ${address}`)
})