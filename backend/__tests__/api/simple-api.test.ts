import { NextApiHandler } from 'next'
import { createRequestHandler } from './helpers/test-client'

// Mock básico
jest.mock('better-auth', () => ({
  betterAuth: jest.fn(),
}))

jest.mock('@better-auth/prisma-adapter', () => ({
  prismaAdapter: jest.fn(),
}))

jest.mock('@/lib/db/prisma', () => ({
  prisma: {
    movement: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}))

// Handler de prueba
const testHandler: NextApiHandler = (req, res) => {
  console.log('Handler ejecutado')
  res.status(200).json({ message: 'OK' })
}

describe('API Simple Test', () => {
  it('debe responder 200', async () => {
    const request = createRequestHandler(testHandler)
    const response = await request.get('/test')
    
    console.log('Status:', response.status)
    console.log('Body:', response.body)
    
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ message: 'OK' })
  })
})