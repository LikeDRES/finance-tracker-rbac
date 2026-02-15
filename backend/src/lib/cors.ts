import { NextApiRequest, NextApiResponse } from 'next'

export function runCors(req: NextApiRequest, res: NextApiResponse) {
  const requestOrigin = req.headers.origin // ← Cambiado de 'origin' a 'requestOrigin'
  
  // Lista de orígenes permitidos
  const allowedOrigins: string[] = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://finance-tracker-rbac-euu2.vercel.app',
    process.env.FRONTEND_URL || '',
  ].filter(Boolean)

  console.log("🌐 CORS - Origin recibido:", requestOrigin)
  console.log("🌐 CORS - Orígenes permitidos:", allowedOrigins)

  // Verificar si el origen está permitido
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    console.log("🌐 CORS - Origen permitido, agregando headers")
    res.setHeader('Access-Control-Allow-Origin', requestOrigin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, Origin, Accept'
    )
  } else {
    console.log("🌐 CORS - Origen NO permitido o ausente")
  }

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    console.log("🌐 CORS - Preflight OPTIONS, respondiendo 200")
    res.status(200).end()
    return true
  }

  return false
}