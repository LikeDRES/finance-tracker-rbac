import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/prisma/client";
import { serialize } from "cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://finance-tracker-rbac-euu2.vercel.app');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Obtener token de la cookie
    const cookies = req.headers.cookie || '';
    const sessionToken = cookies
      .split('; ')
      .find(row => row.startsWith('better-auth.session_token='))
      ?.split('=')[1];

    if (sessionToken) {
      // Eliminar la sesión de la base de datos
      await prisma.session.deleteMany({
        where: { token: sessionToken },
      });
    }

    // Eliminar la cookie
    res.setHeader('Set-Cookie', serialize('better-auth.session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: -1, // Expirar inmediatamente
    }));

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error en sign-out:", error);
    return res.status(500).json({ error: "Error al cerrar sesión" });
  }
}