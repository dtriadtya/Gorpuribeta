// Unit test for the register handler with mocked dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id_user: 1, nama_user: 'Test', email_user: 't@example.com', phone_user: null, role: 'USER', isActive: true, user_dibuat_pada: new Date(), user_diupdate_pada: new Date() })
    }
  }
}))

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed')
}))

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('token')
}))

import { POST } from '@/app/api/auth/register/route'

class MockRequest {
  _body: any
  constructor(body: any) { this._body = body }
  async json() { return this._body }
}

describe('Auth register handler (unit-mocked)', () => {
  test('should return token on valid register', async () => {
    const req = new MockRequest({ name: 'Budi', email: 'budi@example.com', password: 'secure12', phone: '08123' })
    const res = await POST(req as any)

    const body = await res.json()
    expect(body.token).toBeDefined()
    expect(body.user).toBeDefined()
  })
})
