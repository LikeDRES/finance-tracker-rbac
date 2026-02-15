import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "./db/prisma";
import type { User } from "@prisma/client";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", 
  }),

  emailAndPassword: {
    enabled: true,
  },

  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_BASE_URL,
  
  // CONFIGURACIÓN DE ORÍGENES
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    ...(process.env.NODE_ENV === "development" ? ["http://localhost:3000"] : [])
  ],

  // CONFIGURACIÓN EXPLÍCITA DE CORS
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept"],
    exposedHeaders: ["set-cookie"],
  },

  // DESHABILITAR VERIFICACIÓN DE ORIGEN EN DESARROLLO
  ...(process.env.NODE_ENV === "development" && {
    advanced: {
      disableOriginCheck: true, // Esto es CLAVE para desarrollo
    },
  }),

  session: {
    async beforeCreate(session: any, user: User) {
      return {
        ...session,
        user: {
          ...user,
          role: user.role,
        },
      };
    },
    fields: {
      userId: "userId",
      expiresAt: "expiresAt",
      token: "token",
    },
  },

  user: {
    modelName: "user",
    fields: {
      id: "id",
      email: "email",
      name: "name",
      emailVerified: "emailVerified",
      image: "image",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      role: "role",
    },
  },
});