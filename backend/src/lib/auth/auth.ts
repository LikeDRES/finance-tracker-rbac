import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@/prisma/client" // ← el global

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      redirectURI: `${process.env.BETTER_AUTH_BASE_URL!}/api/auth/callback/github`,
    },
  },

  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_BASE_URL!,

  trustedOrigins: [process.env.FRONTEND_URL!],

  cors: {
    origin: [process.env.FRONTEND_URL!], // EXACTAMENTE http://localhost:3001
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  
  session: {
    modelName: "Session",
    fields: {
      token: "token",
      userId: "userId",
      expiresAt: "expiresAt",
    },
  },

  user: {
    modelName: "User",
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
})