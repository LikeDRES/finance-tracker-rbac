import "better-auth";
import type { Role } from "@prisma/client";

// Primero, extiende el tipo User
declare module "better-auth" {
  interface User {
    role: Role;
  }
}

// Luego, crea un tipo para la sesión completa si es necesario
export interface SessionWithRole {
  session: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
  user: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string | null;
    image?: string | null;
    phone?: string | null;
    role: Role;  // ← Esto es lo que agregamos
  };
}