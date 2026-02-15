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
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
}))

jest.mock('@/lib/auth/getServerSession', () => ({
  getServerSession: jest.fn(),
}))

// 2. DESPUÉS: Imports
import { createRequestHandler } from '../../api/helpers/test-client'
import handler from '@/pages/api/users/[id]'
import { getServerSession } from '@/lib/auth/getServerSession'
import { prisma } from '@/lib/db/prisma'

describe('PUT /api/users/[id]', () => {
  const userId = 'user-123'
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('ADMIN debe poder actualizar un usuario', async () => {
    // Mock de sesión como ADMIN
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: {
        id: 'admin-123',
        role: 'ADMIN',
        email: 'admin@test.com',
      },
    })

    // Mock de usuario existente
    const existingUser = {
      id: userId,
      name: 'Usuario Original',
      email: 'user@test.com',
      phone: null,
      role: 'USER',
      emailVerified: false,
      image: null,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    }

    // Mock de usuario actualizado
    const updatedUser = {
      ...existingUser,
      name: 'Usuario Actualizado',
      phone: '+123456789',
      role: 'ADMIN',
      updatedAt: new Date(),
    }

    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser)
    ;(prisma.user.update as jest.Mock).mockResolvedValue(updatedUser)

    const request = createRequestHandler(handler)
    const response = await request
      .put(`/api/users/${userId}`)
      .send({
        name: 'Usuario Actualizado',
        phone: '+123456789',
        role: 'ADMIN',
      })
      .set('Content-Type', 'application/json')

    console.log('Response status:', response.status)
    console.log('Response body:', response.body)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('message', 'Usuario actualizado exitosamente')
    expect(response.body.data).toMatchObject({
      name: 'Usuario Actualizado',
      phone: '+123456789',
      role: 'ADMIN',
    })
    expect(prisma.user.update).toHaveBeenCalledTimes(1)
  })

  test('USER no debe poder actualizar un usuario', async () => {
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
      .put(`/api/users/${userId}`)
      .send({
        name: 'Intento de actualización',
      })
      .set('Content-Type', 'application/json')

    expect(response.status).toBe(403)
    expect(response.body).toMatchObject({
      error: 'FORBIDDEN',
      message: 'Solo los administradores pueden modificar usuarios',
    })
    expect(prisma.user.update).not.toHaveBeenCalled()
  })

  test('debe devolver 404 si el usuario no existe', async () => {
    // Mock de sesión como ADMIN
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: {
        id: 'admin-123',
        role: 'ADMIN',
        email: 'admin@test.com',
      },
    })

    // Mock de usuario no encontrado
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

    const request = createRequestHandler(handler)
    const response = await request
      .put(`/api/users/${userId}`)
      .send({
        name: 'Nuevo nombre',
      })
      .set('Content-Type', 'application/json')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({ error: 'Usuario no encontrado' })
    expect(prisma.user.update).not.toHaveBeenCalled()
  })

  test('debe validar formato de teléfono incorrecto', async () => {
    // Mock de sesión como ADMIN
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: {
        id: 'admin-123',
        role: 'ADMIN',
        email: 'admin@test.com',
      },
    })

    // Mock de usuario existente
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: userId,
      name: 'Usuario',
      email: 'user@test.com',
    })

    const request = createRequestHandler(handler)
    const response = await request
      .put(`/api/users/${userId}`)
      .send({
        phone: 'teléfono inválido!!!',
      })
      .set('Content-Type', 'application/json')

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error', 'VALIDATION_ERROR')
    expect(response.body.details[0].field).toBe('phone')
  })

  test('debe validar nombre demasiado corto', async () => {
    // Mock de sesión como ADMIN
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: {
        id: 'admin-123',
        role: 'ADMIN',
        email: 'admin@test.com',
      },
    })

    // Mock de usuario existente
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: userId,
      name: 'Usuario',
      email: 'user@test.com',
    })

    const request = createRequestHandler(handler)
    const response = await request
      .put(`/api/users/${userId}`)
      .send({
        name: 'a', // Demasiado corto
      })
      .set('Content-Type', 'application/json')

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error', 'VALIDATION_ERROR')
    expect(response.body.details[0].field).toBe('name')
  })

  test('debe permitir actualización parcial (solo un campo)', async () => {
    // Mock de sesión como ADMIN
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: {
        id: 'admin-123',
        role: 'ADMIN',
        email: 'admin@test.com',
      },
    })

    // Mock de usuario existente
    const existingUser = {
      id: userId,
      name: 'Usuario Original',
      email: 'user@test.com',
      phone: null,
      role: 'USER',
    }

    // Mock de usuario actualizado (solo cambia el rol)
    const updatedUser = {
      ...existingUser,
      role: 'ADMIN',
    }

    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser)
    ;(prisma.user.update as jest.Mock).mockResolvedValue(updatedUser)

    const request = createRequestHandler(handler)
    const response = await request
      .put(`/api/users/${userId}`)
      .send({
        role: 'ADMIN', // Solo actualizar el rol
      })
      .set('Content-Type', 'application/json')

    expect(response.status).toBe(200)
    expect(response.body.data.role).toBe('ADMIN')
    expect(response.body.data.name).toBe('Usuario Original') // Sin cambios
    
    // Verificar que update solo recibió el campo role
    const updateCall = (prisma.user.update as jest.Mock).mock.calls[0][0]
    expect(updateCall.data).toHaveProperty('role')
    expect(updateCall.data).not.toHaveProperty('name')
  })
})