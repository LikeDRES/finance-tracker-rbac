import { createRequestHandler, createTestUser, cleanDatabase, prisma } from '../helpers/test-client'
import handler from '@/pages/api/movements/index'
import { getServerSession } from '@/lib/auth/getServerSession'

// Mock de la sesión
jest.mock('@/lib/auth/getServerSession')

describe('POST /api/movements', () => {
  beforeEach(async () => {
    await cleanDatabase()
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('debe crear un movimiento cuando el usuario es ADMIN', async () => {
    const user = await createTestUser('ADMIN')
    
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
      },
    })

    const request = createRequestHandler(handler)

    const response = await request
      .post('/api/movements')
      .send({
        amount: 1500,
        concept: 'Salario prueba',
        date: '2025-04-16',
        type: 'INCOME',
      })
      .set('Content-Type', 'application/json')

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('message', 'Movimiento creado exitosamente')
    expect(response.body.data).toMatchObject({
      amount: 1500,
      concept: 'Salario prueba',
      type: 'INCOME',
    })
  })
})