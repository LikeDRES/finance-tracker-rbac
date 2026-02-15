import { createRequestHandler, createTestUser, createTestMovement, cleanDatabase, prisma } from '../helpers/test-client'
import handler from '@/pages/api/movements/index'
import { getServerSession } from '@/lib/auth/getServerSession'

// Importar los mocks antes que nada
import '../mocks/better-auth'

// Mock específico para este test
jest.mock('@/lib/auth/getServerSession')

describe('GET /api/movements', () => {
  beforeEach(async () => {
    await cleanDatabase()
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('debe listar movimientos con paginación para ADMIN', async () => {
    const admin = await createTestUser('ADMIN')
    
    await createTestMovement(admin.id)
    await createTestMovement(admin.id)
    await createTestMovement(admin.id)

    // Mock de la sesión
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: {
        id: admin.id,
        role: admin.role,
        email: admin.email,
      },
    })

    const request = createRequestHandler(handler)

    const response = await request
      .get('/api/movements?page=1&limit=2')
      .set('Content-Type', 'application/json')

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('data')
    expect(response.body.data).toHaveLength(2)
  })
})