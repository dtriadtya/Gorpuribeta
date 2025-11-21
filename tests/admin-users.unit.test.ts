jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn().mockImplementation(({ where }: any) => {
        if (where && where.id_user === 30) {
          return Promise.resolve({ id_user: 30, nama_user: 'Existing', email_user: 'existing@example.com' })
        }
        return Promise.resolve(null)
      }),
      create: jest.fn().mockResolvedValue({ id_user: 30, nama_user: 'New', email_user: 'new@example.com', phone_user: null, role: 'USER', isActive: true, user_dibuat_pada: new Date(), user_diupdate_pada: new Date() }),
      update: jest.fn().mockResolvedValue({ id_user: 30, nama_user: 'Updated', email_user: 'updated@example.com', phone_user: '081', role: 'ADMIN', isActive: true, user_dibuat_pada: new Date(), user_diupdate_pada: new Date() })
    }
  }
}))

import { POST } from '@/app/api/admin/users/route'
import { PUT } from '@/app/api/admin/users/[id]/route'

class MockRequest { constructor(private body:any){} async json(){ return this.body }}

describe('Admin users create/update (unit-mocked)', () => {
  test('create user', async () => {
    const req = new MockRequest({ name: 'New', email: 'new@example.com', password: 'pw123' })
    const res = await POST(req as any)
    const body = await res.json()
    expect(body.user).toBeDefined()
  })

  test('update user', async () => {
    const req = new MockRequest({ name: 'Updated', role: 'ADMIN' })
    const res = await PUT(req as any, { params: { id: '30' } } as any)
    const body = await res.json()
    expect(body.user).toBeDefined()
  })
})
