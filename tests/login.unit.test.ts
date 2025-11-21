jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn().mockResolvedValue({ id_user: 2, nama_user: 'Ana', email_user: 'ana@example.com', password: '$2a$12$hashed', role: 'USER', isActive: true, user_dibuat_pada: new Date(), user_diupdate_pada: new Date() })
    }
  }
}))

jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockResolvedValue(true)
}))

import { POST } from '@/app/api/auth/login/route'

class MockRequest { constructor(private body:any){} async json(){ return this.body }}

describe('Auth login handler (unit-mocked)', () => {
  test('login success returns token and user', async () => {
    const req = new MockRequest({ email: 'ana@example.com', password: 'password123' })
    const res = await POST(req as any)
    const body = await res.json()
    expect(body.token).toBeDefined()
    expect(body.user).toBeDefined()
  })
})
