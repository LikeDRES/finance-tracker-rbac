import { createServer } from 'http'
import { NextApiHandler } from 'next'
import request from 'supertest'

export function createRequestHandler(handler: NextApiHandler) {
  const server = createServer(async (req, res) => {
    try {
      // Parsear URL
      const url = new URL(req.url || '/', 'http://localhost')
      
      // 🔥 EXTRAER EL ID DE LA URL si existe
      const pathParts = url.pathname.split('/').filter(Boolean)
      const id = pathParts.length > 2 ? pathParts[2] : undefined // /api/movements/[id]
      
      // Crear query params
      const query: any = {
        ...(id && { id }), // Si hay ID, agregarlo a query
      }
      url.searchParams.forEach((value, key) => {
        query[key] = value
      })

      // Capturar body
      let body = null
      if (req.method === 'POST' || req.method === 'PUT') {
        body = await new Promise((resolve) => {
          let data = ''
          req.on('data', chunk => {
            data += chunk
          })
          req.on('end', () => {
            try {
              resolve(data ? JSON.parse(data) : {})
            } catch {
              resolve({})
            }
          })
        })
      }

      // Asignar propiedades al request
      Object.assign(req, {
        query, // Ahora incluye el ID
        body,
        cookies: {},
        headers: req.headers || {},
        method: req.method,
        url: req.url,
      })

      // Versiones extendidas
      const extendedReq = req as any
      const extendedRes = res as any

      // Métodos de respuesta
      extendedRes.json = (data: any) => {
        extendedRes.setHeader('Content-Type', 'application/json')
        extendedRes.end(JSON.stringify(data))
      }

      extendedRes.status = (code: number) => {
        extendedRes.statusCode = code
        return extendedRes
      }

      extendedRes.send = (data: any) => {
        if (typeof data === 'object') {
          extendedRes.setHeader('Content-Type', 'application/json')
          extendedRes.end(JSON.stringify(data))
        } else {
          extendedRes.end(data)
        }
      }

      // Ejecutar handler
      await handler(extendedReq, extendedRes)
    } catch (error) {
      console.error('Error en handler:', error)
      if (!res.headersSent) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ 
          error: 'Internal Server Error', 
          details: error instanceof Error ? error.message : String(error) 
        }))
      }
    }
  })

  return request(server)
}