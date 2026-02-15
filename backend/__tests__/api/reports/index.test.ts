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
      aggregate: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
}))

jest.mock('@/lib/auth/getServerSession', () => ({
  getServerSession: jest.fn(),
}))

// 2. DESPUÉS: Imports
import { createRequestHandler } from '../../api/helpers/test-client'
import handler from '@/pages/api/reports/index'
import { getServerSession } from '@/lib/auth/getServerSession'
import { prisma } from '@/lib/db/prisma'

describe('GET /api/reports', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('ADMIN debe poder generar reporte completo', async () => {
    // Mock de sesión como ADMIN
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: {
        id: 'admin-123',
        role: 'ADMIN',
        email: 'admin@test.com',
      },
    })

    // Mock de agregaciones (ingresos y egresos)
    ;(prisma.movement.aggregate as jest.Mock)
      .mockResolvedValueOnce({ _sum: { amount: 10000 } }) // INCOME
      .mockResolvedValueOnce({ _sum: { amount: 4000 } })  // EXPENSE

    // Mock de movimientos recientes
    ;(prisma.movement.findMany as jest.Mock).mockResolvedValue([
      { 
        id: '1', 
        amount: 1000, 
        concept: 'Venta', 
        date: new Date('2025-04-16'), 
        type: 'INCOME',
        user: { name: 'Usuario', email: 'user@test.com' }
      },
      { 
        id: '2', 
        amount: 500, 
        concept: 'Compra', 
        date: new Date('2025-04-15'), 
        type: 'EXPENSE',
        user: { name: 'Usuario', email: 'user@test.com' }
      },
    ])

    // Mock de estadísticas de usuarios
    ;(prisma.user.findMany as jest.Mock).mockResolvedValue([
      { 
        id: '1', 
        name: 'Usuario 1', 
        email: 'user1@test.com', 
        _count: { movements: 10 } 
      },
      { 
        id: '2', 
        name: 'Usuario 2', 
        email: 'user2@test.com', 
        _count: { movements: 5 } 
      },
    ])

    // Mock de datos para gráfico
    ;(prisma.movement.groupBy as jest.Mock).mockResolvedValue([
      { date: new Date('2025-04-16'), type: 'INCOME', _sum: { amount: 1000 } },
      { date: new Date('2025-04-16'), type: 'EXPENSE', _sum: { amount: 500 } },
    ])

    const request = createRequestHandler(handler)
    const response = await request.get('/api/reports')

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('summary')
    expect(response.body.summary).toEqual({
      totalIncome: 10000,
      totalExpense: 4000,
      balance: 6000,
      totalMovements: 2,
    })
    expect(response.body).toHaveProperty('recentMovements')
    expect(response.body.recentMovements).toHaveLength(2)
    expect(response.body).toHaveProperty('userStats')
    expect(response.body.userStats).toHaveLength(2)
    expect(response.body).toHaveProperty('chartData')
    expect(response.body.chartData).toHaveLength(2)
  })

  test('USER no debe poder generar reporte', async () => {
    // Mock de sesión como USER
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: {
        id: 'user-123',
        role: 'USER',
        email: 'user@test.com',
      },
    })

    const request = createRequestHandler(handler)
    const response = await request.get('/api/reports')

    expect(response.status).toBe(403)
    expect(response.body).toMatchObject({
      error: 'FORBIDDEN',
      message: 'Solo los administradores pueden ver reportes',
    })
  })

  test('debe filtrar por rango de fechas', async () => {
    // Mock de sesión como ADMIN
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: {
        id: 'admin-123',
        role: 'ADMIN',
        email: 'admin@test.com',
      },
    })

    const request = createRequestHandler(handler)
    await request.get('/api/reports?startDate=2025-04-01&endDate=2025-04-30')

    // Verificar que los filtros de fecha se aplicaron
    const aggregateCalls = (prisma.movement.aggregate as jest.Mock).mock.calls
    expect(aggregateCalls[0][0].where.date).toBeDefined()
    expect(aggregateCalls[0][0].where.date.gte).toBeDefined()
    expect(aggregateCalls[0][0].where.date.lte).toBeDefined()
  })

  test('debe manejar cuando no hay movimientos', async () => {
    // Mock de sesión como ADMIN
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: {
        id: 'admin-123',
        role: 'ADMIN',
        email: 'admin@test.com',
      },
    })

    // Mock de agregaciones sin datos
    ;(prisma.movement.aggregate as jest.Mock)
      .mockResolvedValueOnce({ _sum: { amount: null } }) // INCOME
      .mockResolvedValueOnce({ _sum: { amount: null } }) // EXPENSE

    // Mock sin movimientos
    ;(prisma.movement.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.user.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.movement.groupBy as jest.Mock).mockResolvedValue([])

    const request = createRequestHandler(handler)
    const response = await request.get('/api/reports')

    expect(response.status).toBe(200)
    expect(response.body.summary).toEqual({
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      totalMovements: 0,
    })
  })
})