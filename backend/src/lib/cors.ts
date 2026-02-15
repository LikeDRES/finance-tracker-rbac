import { NextApiRequest, NextApiResponse } from 'next'

export function runCors(req: NextApiRequest, res: NextApiResponse) {
  const origin = req.headers.origin
  
  console.log("🌐 CORS - Origin recibido:", origin)
  console.log("🌐 CORS - FRONTEND_URL:", process.env.FRONTEND_URL)

  // Lista de orígenes permitidos
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[]

  console.log("🌐 CORS - Orígenes permitidos:", allowedOrigins)

  // Verificar si el origen está permitido
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
    // En producción, permitir el origen específico aunque no esté en la lista
    if (origin && origin.includes('vercel.app')) {
      console.log("🌐 CORS - Origen de Vercel detectado, permitiendo")
      res.setHeader('Access-Control-Allow-Origin', origin)
      res.setHeader('Access-Control-Allow-Credentials', 'true')
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Origin, Accept'
      )
    }
  }

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    console.log("🌐 CORS - Preflight OPTIONS, respondiendo 200")
    res.status(200).end()
    return true
  }

  return false
}