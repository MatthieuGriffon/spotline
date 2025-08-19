import Fastify from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import * as dotenv from "dotenv";
import cors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";

import prismaPlugin from "@/plugins/prisma";
import emailPlugin from "@/plugins/email";
import sensible from "@fastify/sensible";
import { updateLastSeenPlugin } from "@/plugins/updateLastSeen";

import authRoutes from "@/routes/auth/auth";
import userRoutes from "@/routes/user/user.routes";
import avatarRoutes from "@/routes/upload/avatar.routes";
import groupesRoutes from "@/routes/groupes/groupes.routes";
import groupInvitationsRoutes from "@/routes/groupes/invitations.route";
import invitePublicRoutes from "@/routes/invite/invite.route";
import { accountSessionRoutes } from "@/routes/user/accountSession.route";
import { adminUserRoutes } from "@/routes/admin/userRoutes.routes";
import { adminStatsRoutes } from "@/routes/admin/statsRoutes.routes";
import { reportedPrisesRoutes } from "@/routes/admin/reportedPrise.routes";
import { moderationLogRoutes } from "./routes/admin/moderationLog.routes";
import { dashboardRoutes } from "./routes/dashboard/dashboard.routes";
import chatRoutes from "@/routes/chat/chat.routes";
import chatWsRoutes from "@/routes/chat/chat.ws";
import websocketPlugin from "@fastify/websocket";

import { initAdmin } from "@/scripts/init-admin";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = Fastify({ logger: true }).withTypeProvider<TypeBoxTypeProvider>();

// --- Core plugins
await app.register(cors, {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

await app.register(fastifyCookie);

await app.register(fastifySession, {
  secret: process.env.SESSION_SECRET || "default_dev_secret_should_change", // 🔒 change en prod
  cookie: {
    secure: false, // ⚠️ true en prod avec HTTPS
    httpOnly: true,
    sameSite: "lax",
  },
  saveUninitialized: false,
});

// ⚠️ Dev only: static uploads
await app.register(fastifyStatic, {
  root: path.join(__dirname, "../../uploads"),
  prefix: "/uploads/",
});

// --- App plugins
await app.register(sensible);
await app.register(multipart);
await app.register(prismaPlugin);
await app.register(emailPlugin);
await app.register(updateLastSeenPlugin);
await app.register(websocketPlugin);

// --- Swagger
await app.register(swagger, {
  openapi: {
    info: {
      title: "Spotline API",
      version: "1.0.0",
      description: "Documentation auto-générée de l’API Spotline",
    },
    servers: [{ url: "http://localhost:3000", description: "Dev local" }],
    components: {
      securitySchemes: {
        sessionCookie: { type: "apiKey", in: "cookie", name: "session" },
      },
    },
    security: [{ sessionCookie: [] }],
  },
});

await app.register(swaggerUI, {
  routePrefix: "/docs",
  uiConfig: { docExpansion: "full", deepLinking: true },
});

// --- Routes
await app.register(authRoutes, { prefix: "/api/auth" });
await app.register(userRoutes, { prefix: "/api" });
await app.register(accountSessionRoutes, { prefix: "/api" });
await app.register(adminUserRoutes, { prefix: "/api" });
await app.register(avatarRoutes);
await app.register(adminStatsRoutes, { prefix: "/api/admin" });
await app.register(reportedPrisesRoutes, { prefix: "/api" });
await app.register(moderationLogRoutes, { prefix: "/api/admin" });
await app.register(dashboardRoutes, { prefix: "/api" });

await app.register(groupesRoutes, { prefix: "/api/groupes" });
await app.register(groupInvitationsRoutes, { prefix: "/api/groupes" });
await app.register(invitePublicRoutes, { prefix: "/api" });
await app.register(chatRoutes, { prefix: "/api" }); 
await app.register(chatWsRoutes, { prefix: "/api" });

// --- Init data
app.ready().then(async () => {
  await initAdmin(app.prisma);
});

// --- Listen
app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`🚀 Spotline server listening at ${address}`);
});
