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
    "https://finance-tracker-rbac-vjdu.vercel.app",
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ],

  cors: {
    origin: [
      "http://localhost:3000", 
      "http://localhost:3001",
      "https://finance-tracker-rbac-vjdu.vercel.app",
      ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
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