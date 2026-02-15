import { NextApiRequest, NextApiResponse } from 'next'

export function runCors(req: NextApiRequest, res: NextApiResponse) {
  const origin = req.headers.origin
  
  // Lista de orígenes permitidos (incluye la URL exacta del frontend)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://finance-tracker-rbac-euu2.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[]

  console.log("🌐 CORS - Origin recibido:", origin)
  console.log("🌐 CORS - Orígenes permitidos:", allowedOrigins)

  if (origin && allowedOrigins.includes(origin)) {
    console.log("🌐 CORS - Origen permitido, agregando headers")
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, Origin, Accept'
    )
  } else {
    console.log("🌐 CORS - Origen NO permitido o ausente")
  }

  if (req.method === 'OPTIONS') {
    console.log("🌐 CORS - Preflight OPTIONS, respondiendo 200")
    res.status(200).end()
    return true
  }

  return false
}