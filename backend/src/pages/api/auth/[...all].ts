import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/lib/auth";
import { toNodeHandler } from "better-auth/node";

const authHandler = toNodeHandler(auth);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("🔐 Auth catch-all called:", req.method, req.url);
  
  // 🔥 FORZAR CORS EN TODAS LAS RESPUESTAS
  const origin = req.headers.origin;
  
  // Lista de orígenes permitidos
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://finance-tracker-rbac-vjdu.vercel.app',
    process.env.FRONTEND_URL,
  ].filter(Boolean);
  
  // Siempre establecer headers CORS si el origen está permitido
  if (origin && allowedOrigins.includes(origin)) {
    console.log("🌐 Estableciendo headers CORS para:", origin);
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, Accept');
    res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight por 24 horas
  }

  // Manejar preflight OPTIONS - DEVOLVER 200 SIEMPRE
  if (req.method === 'OPTIONS') {
    console.log("🌐 Respondiendo a preflight OPTIONS con 200");
    return res.status(200).end();
  }

  try {
    await authHandler(req, res);
  } catch (error) {
    console.error("Error en auth handler:", error);
    res.status(500).json({ error: "Error interno" });
  }
}