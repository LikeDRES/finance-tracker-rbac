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
  
  if (runCors(req, res)) return;

  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  try {
    await authHandler(req, res);
  } catch (error) {
    console.error("Error en auth handler:", error);
    res.status(500).json({ error: "Error interno" });
  }
}