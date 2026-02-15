import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/lib/auth";
import { toNodeHandler } from "better-auth/node";
import { runCors } from "@/lib/cors";

const authHandler = toNodeHandler(auth);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("🔐 Auth catch-all called:", req.method, req.url);
  
  // 🔥 FORZAR CORS ANTES QUE NADA
  const origin = req.headers.origin;
  
  // Lista de orígenes permitidos
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://finance-tracker-rbac-vjdu-ppyt3rv01-likedres-projects.vercel.app',
    process.env.FRONTEND_URL,
  ].filter(Boolean);
  
  console.log("🌐 Origen recibido:", origin);
  console.log("🌐 Orígenes permitidos:", allowedOrigins);
  
  // Si el origen está permitido, establecer headers
  if (origin && allowedOrigins.includes(origin)) {
    console.log("🌐 Origen permitido, agregando headers");
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, Accept');
  }
  
  // Manejar preflight OPTIONS
  if (req.method === 'OPTIONS') {
    console.log("🌐 Preflight OPTIONS, respondiendo 200");
    return res.status(200).end();
  }

  try {
    await authHandler(req, res);
  } catch (error) {
    console.error("Error en auth handler:", error);
    res.status(500).json({ error: "Error interno" });
  }
}