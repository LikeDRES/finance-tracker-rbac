import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "../db/prisma";
import type { User } from "@prisma/client";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", 
  }),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      redirectUri: `${process.env.BETTER_AUTH_BASE_URL}/api/auth/callback/github`,
    },
  },

  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_BASE_URL,
  
trustedOrigins: [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  process.env.FRONTEND_URL!,
  ...(process.env.NODE_ENV === "production" ? [process.env.FRONTEND_URL!] : [])
].filter(Boolean),

  cors: {
    origin: [
      "http://localhost:3000", 
      "http://localhost:3001",
      ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []) // ← Solo si existe
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept"],
    exposedHeaders: ["set-cookie"],
  },

  ...(process.env.NODE_ENV === "development" && {
    advanced: {
      disableOriginCheck: true,
    },
  }),

  session: {
    modelName: "session",
    fields: {
      token: "token",
      userId: "userId",
      expiresAt: "expiresAt",
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