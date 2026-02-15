import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/lib/auth";
import { runCors } from "@/lib/cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Aplicar CORS
  if (runCors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await auth.api.signInEmail({
      body: {
        email: req.body.email,
        password: req.body.password,
      },
      headers: req.headers as any,
    });

    // Agregar headers CORS explícitamente
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(401).json({ 
      error: "Credenciales inválidas",
    });
  }
}