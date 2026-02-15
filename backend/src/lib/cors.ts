import { NextApiRequest, NextApiResponse } from 'next'

export function runCors(req: NextApiRequest, res: NextApiResponse) {
  const origin = req.headers.origin
  
  // Lista de orígenes permitidos (incluye la URL exacta del frontend)
const allowedOrigins: string[] = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://finance-tracker-rbac-vjdu.vercel.app',
  process.env.FRONTEND_URL || '', // undefined → '' vacío
].filter(Boolean)

const origin = req.headers.origin || ''

console.log("🌐 CORS - Origin recibido:", origin)
console.log("🌐 CORS - Orígenes permitidos:", allowedOrigins)

if (allowedOrigins.includes(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, Accept')
} else {
  console.warn(`🌐 CORS - Origen NO permitido: ${origin}`)
}

if (req.method === 'OPTIONS') {
  res.status(200).end()
  return true
}