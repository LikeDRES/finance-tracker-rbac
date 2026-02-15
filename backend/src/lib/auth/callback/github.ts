import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/lib/auth";
import { runCors } from "@/lib/cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("📞 GitHub callback received");
  console.log("🔍 Query params:", req.query);
  
  if (runCors(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code } = req.query;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Código requerido" });
  }

  try {
    // 🔥 Construir la URL de callback para Better Auth
    const callbackUrl = `${process.env.BETTER_AUTH_BASE_URL}/api/auth/callback/github?code=${code}`;
    
    console.log("🔄 Llamando a Better Auth con callback URL:", callbackUrl);

    // Hacer una petición al endpoint de callback de Better Auth
    const response = await fetch(callbackUrl, {
      method: "GET",
      headers: {
        Cookie: req.headers.cookie || '',
      },
    });

    if (!response.ok) {
      throw new Error(`Better Auth callback failed: ${response.status}`);
    }

    // Obtener la cookie de sesión de la respuesta
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      res.setHeader('Set-Cookie', setCookie);
    }

    console.log("✅ Login exitoso con Better Auth");

    const frontendUrl = "http://localhost:3001";
    res.redirect(`${frontendUrl}/movements`);

  } catch (err) {
    const error = err as Error;
    console.error("❌ Error en callback:", error.message);
    const frontendUrl = "http://localhost:3001";
    res.redirect(`${frontendUrl}/login?error=auth_failed`);
  }
}