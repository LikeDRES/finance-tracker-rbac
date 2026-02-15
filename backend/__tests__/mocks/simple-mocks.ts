// Mock de better-auth
jest.mock('better-auth', () => ({
  betterAuth: jest.fn(() => ({
    api: {
      getSession: jest.fn().mockResolvedValue(null),
      signUpEmail: jest.fn(),
      signInEmail: jest.fn(),
    },
  })),
}))

jest.mock('@better-auth/prisma-adapter', () => ({
  prismaAdapter: jest.fn(() => ({})),
}))

// Mock de prisma
jest.mock('@/lib/db/prisma', () => ({
  prisma: {
    movement: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
}))

// Mock de la sesión
jest.mock('@/lib/auth/getServerSession', () => ({
  getServerSession: jest.fn(),
}))