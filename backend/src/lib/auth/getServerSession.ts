// src/lib/auth/getServerSession.ts
import { auth } from "./auth";
import { NextApiRequest } from "next";
import { prisma } from "../../../prisma/client";
import type { Role } from "@prisma/client";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  image?: string | null;
  role: Role;
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

export async function getServerSession(req: NextApiRequest): Promise<Session | null> {
  const headers = new Headers();

  Object.entries(req.headers).forEach(([key, value]) => {
    if (value) {
      headers.set(key, Array.isArray(value) ? value.join(",") : value);
    }
  });

  try {
    // 1. Obtener la sesión de Better Auth
    const session = await auth.api.getSession({ headers });
    
    if (!session) return null;
    
    // 2. Consultar el role directamente de la base de datos
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    
    // 3. Combinar la sesión con el role de la BD
    const sessionWithRole: Session = {
      ...session,
      user: {
        ...session.user,
        role: dbUser?.role || "USER",
      },
    } as Session;
    
    console.log("✅ Sesión obtenida para:", sessionWithRole.user.email);
    
    return sessionWithRole;
  } catch (error) {
    console.error("❌ Error en getServerSession:", error);
    return null;
  }
}