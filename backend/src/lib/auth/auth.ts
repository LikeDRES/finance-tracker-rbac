import { betterAuth } from "better-auth"
import { prismaAdapter } from "@better-auth/prisma-adapter"
import { prisma } from "../../../prisma/client"

let _auth: ReturnType<typeof betterAuth> | null = null

export function getAuth() {
  if (_auth) return _auth

  _auth = betterAuth({
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),

    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        // AGREGADO: redirectURI explícito
        redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/github`,
      },
    },

    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL!,

    // AGREGADO: Configuración de orígenes confiables
    trustedOrigins: [process.env.FRONTEND_URL!],

    // AGREGADO: Configuración CORS explícita
    cors: {
      origin: [process.env.FRONTEND_URL!],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },

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
  })

  return _auth
}