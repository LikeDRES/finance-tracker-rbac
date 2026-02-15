import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/prisma/client";
import { serialize } from "cookie";
import crypto from "crypto";

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

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code } = req.query;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Código de autorización requerido" });
  }

  try {
    // 1. Intercambiar el código por un token de acceso
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.BETTER_AUTH_BASE_URL}/api/auth/callback/github`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(tokenData.error_description || "Error al obtener token");
    }

    // 2. Obtener datos básicos del usuario de GitHub
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error("Error al obtener datos del usuario");
    }

    const githubUser = await userResponse.json();

    // 3. Obtener emails del usuario (GitHub no siempre devuelve el email público)
    const emailsResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const emails = await emailsResponse.json();
    const primaryEmail = emails.find((email: any) => email.primary && email.verified);

    if (!primaryEmail) {
      throw new Error("No se encontró un email principal verificado");
    }

    // 4. Buscar o crear usuario en la base de datos
    let user = await prisma.user.findUnique({
      where: { email: primaryEmail.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: primaryEmail.email,
          name: githubUser.name || githubUser.login,
          image: githubUser.avatar_url,
          role: "ADMIN", // Por defecto ADMIN
        },
      });
      console.log("✅ Usuario creado:", user.id);
    }

    // 5. Crear sesión manualmente
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 días

    // Eliminar sesiones anteriores del usuario (opcional)
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    // Crear nueva sesión
    await prisma.session.create({
      data: {
        token: sessionToken,
        userId: user.id,
        expiresAt: expiresAt,
      },
    });

    // 6. Establecer la cookie de sesión
    res.setHeader('Set-Cookie', serialize('better-auth.session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 días en segundos
    }));

    // 7. Redirigir al frontend
    const frontendUrl = 'https://finance-tracker-rbac-euu2.vercel.app';
    res.redirect(`${frontendUrl}/movements`);

  } catch (error) {
    console.error("Error en callback de GitHub:", error);
    const frontendUrl = 'https://finance-tracker-rbac-euu2.vercel.app';
    res.redirect(`${frontendUrl}/login?error=auth_failed`);
  }
}