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
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
}))

jest.mock('@/lib/auth/getServerSession', () => ({
  getServerSession: jest.fn(),
}))

// 2. DESPUÉS: Imports
import { createRequestHandler } from '../../api/helpers/test-client'
import handler from '@/pages/api/users/index'
import { getServerSession } from '@/lib/auth/getServerSession'
import { prisma } from '@/lib/db/prisma'

describe('GET /api/users', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('ADMIN debe poder listar usuarios', async () => {
    // Mock de sesión como ADMIN
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: {
        id: 'admin-123',
        role: 'ADMIN',
        email: 'admin@test.com',
      },
    })

    // Mock de usuarios
    const mockUsers = [
      {
        id: 'user-1',
        name: 'Usuario 1',
        email: 'user1@test.com',
        phone: null,
        role: 'ADMIN',
        emailVerified: false,
        image: null,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        _count: { movements: 5, accounts: 1, sessions: 1 },
      },
      {
        id: 'user-2',
        name: 'Usuario 2',
        email: 'user2@test.com',
        phone: '+123456789',
        role: 'USER',
        emailVerified: true,
        image: null,
        createdAt: new Date('2025-01-02'),
        updatedAt: new Date('2025-01-02'),
        _count: { movements: 3, accounts: 1, sessions: 1 },
      },
    ]

    ;(prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers)
    ;(prisma.user.count as jest.Mock).mockResolvedValue(2)

    const request = createRequestHandler(handler)
    const response = await request.get('/api/users?page=1&limit=10')

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('data')
    expect(response.body.data).toHaveLength(2)
    expect(response.body.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 2,
      pages: 1,
    })
  })

  test('USER no debe poder listar usuarios', async () => {
    // Mock de sesión como USER
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: {
        id: 'user-123',
        role: 'USER',
        email: 'user@test.com',
      },
    })

    const request = createRequestHandler(handler)
    const response = await request.get('/api/users')

    expect(response.status).toBe(403)
    expect(response.body).toMatchObject({
      error: 'FORBIDDEN',
      message: 'Solo los administradores pueden acceder a este recurso',
    })
  })

  test('debe filtrar por búsqueda', async () => {
    // Mock de sesión como ADMIN
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: {
        id: 'admin-123',
        role: 'ADMIN',
        email: 'admin@test.com',
      },
    })

    const request = createRequestHandler(handler)
    await request.get('/api/users?search=test')

    // Verificar que el filtro de búsqueda se aplicó
    const findManyCalls = (prisma.user.findMany as jest.Mock).mock.calls
    const whereClause = findManyCalls[0][0].where
    expect(whereClause.OR).toBeDefined()
    expect(whereClause.OR).toHaveLength(2)
  })

  test('debe manejar la paginación correctamente', async () => {
    // Mock de sesión como ADMIN
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: {
        id: 'admin-123',
        role: 'ADMIN',
        email: 'admin@test.com',
      },
    })

    const request = createRequestHandler(handler)
    await request.get('/api/users?page=2&limit=5')

    const findManyCalls = (prisma.user.findMany as jest.Mock).mock.calls
    const options = findManyCalls[0][0]
    expect(options.skip).toBe(5) // (page-1) * limit
    expect(options.take).toBe(5)
  })
})