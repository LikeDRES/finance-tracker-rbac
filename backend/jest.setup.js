import '@testing-library/jest-dom'

// Polyfills para Node.js
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock de fetch si no existe
if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn()
}

// Mock de IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return null }
  unobserve() { return null }
  disconnect() { return null }
}