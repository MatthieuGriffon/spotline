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
