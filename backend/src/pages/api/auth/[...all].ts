// pages/api/auth/[...all].ts
import { toNodeHandler } from "better-auth/node";
import { auth } from "@/lib/auth"
import { runCors } from "@/lib/cors" // Ajusta la ruta según donde guardes runCors
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ejecutar CORS primero
  const isPreflight = runCors(req, res)
  
  // Si fue preflight (OPTIONS), ya respondimos
  if (isPreflight) {
    return
  }

  // Log para debug
  console.log(`🔥 Auth handler ejecutándose para: ${req.url}`)
  console.log(`📌 Método: ${req.method}`)

  try {
    // Dejar que Better Auth maneje la ruta
    return toNodeHandler(auth)(req, res)
  } catch (error) {
    console.error('Error en auth handler:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}