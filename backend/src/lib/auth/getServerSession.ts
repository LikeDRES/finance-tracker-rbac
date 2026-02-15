import { auth } from "./auth";
import { NextApiRequest } from "next";
import { prisma } from "@/lib/db/prisma";
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
  // LOG 1: Ver qué cookies llegan al backend
  console.log("=".repeat(50));
  console.log("🔍 getServerSession llamado");
  console.log("🍪 Cookies crudas del request:", req.headers.cookie);
  
  // Parsear cookies manualmente para ver si la cookie específica está presente
  const cookies = req.headers.cookie || '';
  const sessionCookie = cookies
    .split('; ')
    .find(row => row.startsWith('better-auth.session_token='));
  console.log("🍪 better-auth.session_token encontrada:", sessionCookie ? "SÍ" : "NO");
  if (sessionCookie) {
    console.log("🍪 Valor (primeros 20 chars):", sessionCookie.substring(0, 30) + "...");
  }

  const headers = new Headers();

  Object.entries(req.headers).forEach(([key, value]) => {
    if (value) {
      headers.set(key, Array.isArray(value) ? value.join(",") : value);
    }
  });

  console.log("📦 Headers construidos para Better Auth:", Object.fromEntries(headers.entries()));

  try {
    // 1. Obtener la sesión de Better Auth
    console.log("🔄 Llamando a auth.api.getSession...");
    const session = await auth.api.getSession({ headers });
    
    if (!session) {
      console.log("❌ Better Auth no devolvió sesión");
      return null;
    }
    
    console.log("✅ Better Auth devolvió sesión para usuario:", session.user.id);
    
    // 2. Consultar el role directamente de la base de datos
    console.log("🔄 Consultando role en BD para usuario:", session.user.id);
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    
    console.log("✅ Role en BD:", dbUser?.role || "No encontrado");
    
    // 3. Combinar la sesión con el role de la BD
    const sessionWithRole: Session = {
      ...session,
      user: {
        ...session.user,
        role: dbUser?.role || "USER",
      },
    } as Session;
    
    console.log("🔐 Sesión final construida con role:", sessionWithRole.user.role);
    console.log("=".repeat(50));
    
    return sessionWithRole;
  } catch (error) {
    console.error("❌ Error en getServerSession:", error);
    return null;
  }
}