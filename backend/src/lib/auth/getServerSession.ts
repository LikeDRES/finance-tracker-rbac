import { auth } from "./auth"
import type { NextApiRequest } from "next"
import type { Role } from "@prisma/client"

export interface SessionUser {
  id: string
  email: string
  name: string | null
  image?: string | null
  role: Role
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Session {
  user: SessionUser
  session: {
    id: string
    token: string
    userId: string
    expiresAt: Date
    ipAddress?: string | null
    userAgent?: string | null
    createdAt: Date
    updatedAt: Date
  }
}

export async function getServerSession(
  req: NextApiRequest
): Promise<Session | null> {
  try {
    const headers = new Headers(
      Object.entries(req.headers).reduce((acc, [key, value]) => {
        if (value) {
          acc[key] = Array.isArray(value) ? value.join(",") : value
        }
        return acc
      }, {} as Record<string, string>)
    )

    const session = await auth.api.getSession({ headers })
    return session as Session | null
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}