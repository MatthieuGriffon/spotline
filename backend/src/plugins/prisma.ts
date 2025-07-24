import * as dotenv from 'dotenv'
dotenv.config() //
import fp from 'fastify-plugin'
import { PrismaClient } from '@prisma/client'

export default fp(async (fastify) => {
  const prisma = new PrismaClient() // PAS en haut du fichier !
  await prisma.$connect()
  fastify.decorate('prisma', prisma)
 console.log('[PRISMA DEBUG] DATABASE_URL =', process.env.DATABASE_URL)
})