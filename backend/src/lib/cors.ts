import { NextApiRequest, NextApiResponse } from 'next'

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []), // ← Solo si existe
].filter(Boolean)

export function runCors(req: NextApiRequest, res: NextApiResponse) {
  const origin = req.headers.origin

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, Origin, Accept'
    )
  }

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return true
  }

  return false
}