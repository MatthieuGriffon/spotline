import "fastify";

export interface SessionUser {
  id: string;
  email: string;
  pseudo: string;
  role: "USER" | "ADMIN";
  imageUrl: string | null;
  isConfirmed: boolean;
}

declare module "fastify" {
  interface Session {
    user?: SessionUser;
    accountSessionId?: string;
  }

  interface FastifyInstance {
    prisma: import("@prisma/client").PrismaClient;
    email: {
      sendMail: (params: {
        to: string;
        subject: string;
        html: string;
      }) => Promise<void>;
    };
  }
  interface FastifyRequest {
    groupMember?: {
      userId: string;
      groupId: string;
      role: "admin" | "member" | "guest";
      joinedAt?: Date;
    };
  }
}

declare module "@fastify/session" {
  // Données réellement sérialisées en store (le plus important)
  interface SessionData {
    user?: import("./fastify").SessionUser;
    accountSessionId?: string;
    pendingInvite?: { token: string; action: "accept" | "decline" } | null;
  }

  // Interface runtime (parfois utile selon la version)
  interface Session {
    user?: import("./fastify").SessionUser;
    accountSessionId?: string;
    pendingInvite?: { token: string; action: "accept" | "decline" } | null;
  }
}
declare module "fastify" {
  interface FastifyRequest {
    session: import("@fastify/session").FastifySessionObject & {
      pendingInvite?: { token: string; action: "accept" | "decline" } | null;
      user?: SessionUser;
      accountSessionId?: string;
    };
  }
}
declare module "fastify" {
  interface SessionStoreData {
    pendingInvite?: { token: string; action: "accept" | "decline" } | null;
  }
}
