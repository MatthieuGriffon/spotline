import Fastify from 'fastify'
import * as dotenv from 'dotenv'
import prismaPlugin from '@/plugins/prisma'
import emailPlugin from '@/plugins/email'
import sensible from '@fastify/sensible'
import authRoutes from '@/routes/auth/auth'
import userRoutes from '@/routes/user/user.routes'
import avatarRoutes from '@/routes/upload/avatar.routes'
import { initAdmin } from '@/scripts/init-admin'

import fastifyStatic from '@fastify/static'
import path from 'path'

import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config()
const app = Fastify({
  logger: true
})
import fastifyCookie from '@fastify/cookie'
import fastifySession from '@fastify/session'
import multipart from '@fastify/multipart'
// TODO 🚨 En production, NE PAS servir /uploads/ en statique directement.
// Remplacer fastifyStatic par une route protégée GET /uploads/avatar/:filename
// pour éviter tout accès non autorisé aux fichiers utilisateurs (avatars, prises, etc.)
// TODO 🚨 En production, mettre secure: true dans les cookies de session

// Register plugins
app.register(fastifyStatic, {
  root: path.join(__dirname, '../uploads'),
  prefix: '/uploads/',
})
app.register(fastifyCookie)

app.register(fastifySession, {
  secret: process.env.SESSION_SECRET || 'default_dev_secret_should_change', // 🔒 change en prod
  cookie: {
    secure: false, // ⚠️ true en prod avec HTTPS
    httpOnly: true,
    sameSite: 'lax',
  },
  saveUninitialized: false,
})



app.register(prismaPlugin)
app.register(emailPlugin)
app.register(sensible)
app.register(multipart)

// Initialize admin user
app.ready().then(async () => {
  await initAdmin(app.prisma)
})

// Register routes
app.register(authRoutes, { prefix: '/api/auth' })
app.register(userRoutes, { prefix: '/api' })
app.register(avatarRoutes)

// listen on port 3000
app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  app.log.info(`🚀 Spotline server listening at ${address}`)
})