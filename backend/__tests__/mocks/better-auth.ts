// Mock completo de better-auth
jest.mock('better-auth', () => ({
  betterAuth: jest.fn(() => ({
    api: {
      getSession: jest.fn(),
      signUpEmail: jest.fn(),
      signInEmail: jest.fn(),
    },
  })),
}))

jest.mock('@better-auth/prisma-adapter', () => ({
  prismaAdapter: jest.fn(() => ({})),
}))

// Mock de las funciones de sesión
jest.mock('@/lib/auth/getServerSession', () => ({
  getServerSession: jest.fn(),
}))

// Mock de bcrypt o cualquier otra dependencia problemática
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}))