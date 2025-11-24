// Learn more: https://github.com/testing-library/jest-dom
require('@testing-library/jest-dom')

// Polyfills para NextRequest en Jest
// Next.js necesita Request/Response/Headers disponibles
// En Node.js 18+, estos están disponibles globalmente
// Para Jest, Next.js los proporciona automáticamente cuando se importa
// No necesitamos polyfills aquí - Next.js los maneja

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: function Image(props) {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return require('react').createElement('img', props)
  },
}))

// Mock environment variables
process.env.AUTH_SECRET = 'test-auth-secret'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
process.env.NODE_ENV = 'test'
process.env.MAILERSEND_API_TOKEN = 'mlsn.test-token'
process.env.MAILERSEND_FROM_EMAIL = 'test@test.com'
process.env.APP_URL = 'http://localhost:3000'

