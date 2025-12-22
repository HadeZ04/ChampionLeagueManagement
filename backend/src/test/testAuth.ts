import jwt from 'jsonwebtoken'

export function makeToken(permissions: string[] = [], overrides: Record<string, unknown> = {}) {
  const secret = process.env.JWT_SECRET || 'test-secret'
  const payload = {
    sub: 1,
    username: 'test-admin',
    roles: ['admin'],
    permissions,
    type: 'access',
    ...overrides
  }

  return jwt.sign(payload, secret)
}

