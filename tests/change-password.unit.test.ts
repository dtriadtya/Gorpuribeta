
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn().mockResolvedValue({ id_user: 20, password: '$2a$12$hashed', nama_user: 'User20' }),
      update: jest.fn().mockResolvedValue({ id_user: 20, nama_user: 'User20', email_user: 'u20@example.com' })
    }
  }
}))

jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('newhash')
}))

jest.mock('@/lib/auth', () => ({
  authenticateRequest: jest.fn().mockReturnValue({ userId: 20 })
}))

import { POST } from '@/app/api/users/change-password/route'

class MockRequest { constructor(private body:any){} async json(){ return this.body }}

describe('Change password (unit-mocked)', () => {
  test('change password success', async () => {
    const req = new MockRequest({ userId: 20, currentPassword: 'old', newPassword: 'newpass123' })
    const res = await POST(req as any)
    const body = await res.json()
    expect(body.message).toMatch(/berhasil/i)
  })
})
