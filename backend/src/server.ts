import Fastify from 'fastify'
import * as dotenv from 'dotenv'
import cors from '@fastify/cors'
import prismaPlugin from '@/plugins/prisma'
import emailPlugin from '@/plugins/email'
import sensible from '@fastify/sensible'
import authRoutes from '@/routes/auth/auth'
import userRoutes from '@/routes/user/user.routes'
import avatarRoutes from '@/routes/upload/avatar.routes'
import { adminUserRoutes } from '@/routes/admin/userRoutes.routes'
import { initAdmin } from '@/scripts/init-admin'
import { accountSessionRoutes } from '@/routes/user/accountSession.route'
import { updateLastSeenPlugin } from '@/plugins/updateLastSeen'
import { adminStatsRoutes } from '@/routes/admin/statsRoutes.routes'
import { reportedPrisesRoutes } from '@/routes/admin/reportedPrise.routes'
import { moderationLogRoutes } from './routes/admin/moderationLog.routes'
import { dashboardRoutes } from './routes/dashboard/dashboard.routes'


import fastifyStatic from '@fastify/static'
import path from 'path'

import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'

import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config()
const app = Fastify({
  logger: true
})
// Enable CORS for all origins
await app.register(cors, {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
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
  root: path.join(__dirname, '../../uploads'),
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


app.register(updateLastSeenPlugin)
app.register(prismaPlugin)
app.register(emailPlugin)
app.register(sensible)
app.register(multipart)

// Initialize admin user
app.ready().then(async () => {
  await initAdmin(app.prisma)
})

app.register(swagger, {
  openapi: {
    info: {
      title: 'Spotline API',
      version: '1.0.0',
      description: 'Documentation auto-générée de l’API Spotline'
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Dev local' }
    ],
    components: {
      securitySchemes: {
        sessionCookie: {
          type: 'apiKey',
          in: 'cookie',
          name: 'session'
        }
      }
    },
    security: [
      { sessionCookie: [] }
    ]
  }
})

app.register(swaggerUI, {
  routePrefix: '/docs', // Accès via http://localhost:3000/docs
  uiConfig: {
    docExpansion: 'full',
    deepLinking: true
  }
})

// Register routes
app.register(authRoutes, { prefix: '/api/auth' })
app.register(userRoutes, { prefix: '/api' })
app.register(accountSessionRoutes, { prefix: '/api' })
app.register(adminUserRoutes, { prefix: '/api' })
app.register(avatarRoutes)
app.register(adminStatsRoutes, { prefix: '/api/admin' })
app.register(reportedPrisesRoutes, { prefix: '/api' })
app.register(moderationLogRoutes, { prefix: '/api/admin'})
app.register(dashboardRoutes, { prefix: '/api' })



// listen on port 3000
app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  app.log.info(`🚀 Spotline server listening at ${address}`)
})