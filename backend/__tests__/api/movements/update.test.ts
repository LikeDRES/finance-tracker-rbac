// 1. PRIMERO: Mocks
jest.mock('better-auth', () => ({
  betterAuth: jest.fn(() => ({
    api: {
      getSession: jest.fn(),
    },
  })),
}))

jest.mock('@better-auth/prisma-adapter', () => ({
  prismaAdapter: jest.fn(() => ({})),
}))

jest.mock('@/lib/db/prisma', () => ({
  prisma: {
    movement: {
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
}))

jest.mock('@/lib/auth/getServerSession', () => ({
  getServerSession: jest.fn(),
}))

// 2. DESPUÉS: Imports
import { createRequestHandler } from '../helpers/test-client'
import handler from '@/pages/api/movements/[id]'
import { getServerSession } from '@/lib/auth/getServerSession'
import { prisma } from '@/lib/db/prisma'

describe('PUT /api/movements/[id]', () => {
  const movementId = 'cmlmtu3kt0001316ezft03jx9' // Usar un ID válido de ejemplo
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('ADMIN debe poder actualizar un movimiento', async () => {
    // Mock de sesión como ADMIN
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: {
        id: 'admin-123',
        role: 'ADMIN',
        email: 'admin@test.com',
      },
    })

    // Mock de movimiento existente
    const existingMovement = {
      id: movementId,
      amount: 1000,
      concept: 'Concepto original',
      date: new Date('2025-04-16'),
      type: 'INCOME',
      userId: 'user-123',
    }

    // Mock de movimiento actualizado
    const updatedMovement = {
      ...existingMovement,
      amount: 2000,
      concept: 'Concepto actualizado',
    }

    ;(prisma.movement.findUnique as jest.Mock).mockResolvedValue(existingMovement)
    ;(prisma.movement.update as jest.Mock).mockResolvedValue(updatedMovement)

    const request = createRequestHandler(handler)
    const response = await request
      .put(`/api/movements/${movementId}`)
      .send({
        amount: 2000,
        concept: 'Concepto actualizado',
      })
      .set('Content-Type', 'application/json')

    console.log('Response status:', response.status)
    console.log('Response body:', response.body)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('message', 'Movimiento actualizado exitosamente')
    expect(response.body.data).toMatchObject({
      amount: 2000,
      concept: 'Concepto actualizado',
    })
    expect(prisma.movement.update).toHaveBeenCalledTimes(1)
  })

  test('USER no debe poder actualizar un movimiento', async () => {
    // Mock de sesión como USER
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: {
        id: 'user-123',
        role: 'USER',
        email: 'user@test.com',
      },
    })

    const request = createRequestHandler(handler)
    const response = await request
      .put(`/api/movements/${movementId}`)
      .send({
        amount: 2000,
        concept: 'Concepto actualizado',
      })
      .set('Content-Type', 'application/json')

    expect(response.status).toBe(403)
    expect(response.body).toMatchObject({
      error: 'FORBIDDEN',
      message: 'Solo los administradores pueden actualizar movimientos',
    })
    expect(prisma.movement.update).not.toHaveBeenCalled()
  })

  test('debe devolver 404 si el movimiento no existe', async () => {
    // Mock de sesión como ADMIN
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: {
        id: 'admin-123',
        role: 'ADMIN',
        email: 'admin@test.com',
      },
    })

    // Mock de movimiento no encontrado
    ;(prisma.movement.findUnique as jest.Mock).mockResolvedValue(null)

    const request = createRequestHandler(handler)
    const response = await request
      .put(`/api/movements/${movementId}`)
      .send({
        amount: 2000,
        concept: 'Concepto actualizado',
      })
      .set('Content-Type', 'application/json')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({ error: 'Movimiento no encontrado' })
    expect(prisma.movement.update).not.toHaveBeenCalled()
  })

  test('debe validar datos incorrectos', async () => {
    // Mock de sesión como ADMIN
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: {
        id: 'admin-123',
        role: 'ADMIN',
        email: 'admin@test.com',
      },
    })

    // Mock de movimiento existente (necesario para pasar la validación de existencia)
    ;(prisma.movement.findUnique as jest.Mock).mockResolvedValue({
      id: movementId,
      amount: 1000,
      concept: 'Test',
    })

    const request = createRequestHandler(handler)
    const response = await request
      .put(`/api/movements/${movementId}`)
      .send({
        amount: -500, // Monto negativo
        concept: 'a', // Muy corto
      })
      .set('Content-Type', 'application/json')

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error', 'VALIDATION_ERROR')
  })
})