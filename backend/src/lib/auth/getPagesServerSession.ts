// src/lib/auth/getServerSession.ts
import { auth } from "./auth";
import { NextRequest } from "next/server";
import { NextApiRequest } from "next";
import type { Role } from "@prisma/client";  // Importa el enum Role

// Definir los tipos de sesión
export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  image?: string | null;
  role: Role;  // ← Incluye role
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  user: SessionUser;
  session: {
    id: string;
    token: string;
    userId: string;
    expiresAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

// Para App Router (NextRequest)
export async function getAppServerSession(req: NextRequest): Promise<Session | null> {
  try {
    const headers = new Headers(req.headers);
    const session = await auth.api.getSession({ headers });
    return session as Session | null;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

// Para Pages Router (NextApiRequest)
export async function getPagesServerSession(req: NextApiRequest): Promise<Session | null> {
  const headers = new Headers();

  Object.entries(req.headers).forEach(([key, value]) => {
    if (value) {
      headers.set(key, Array.isArray(value) ? value.join(",") : value);
    }
  });

  try {
    const session = await auth.api.getSession({ headers });
    return session as Session | null;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

// Alias para compatibilidad
export const getServerSession = getPagesServerSession;