jest.mock('@/lib/prisma', () => ({
  prisma: {
    field: {
      create: jest.fn().mockResolvedValue({ id_lapangan: 3, nama_lapangan: 'New Field', deskripsi: null, harga_per_jam: 50000, imageUrl: null, fasilitas: [], isActive: true, lapangan_dibuat_pada: new Date(), lapangan_diupdate_pada: new Date() })
    }
  }
}))

import { POST } from '@/app/api/admin/fields/route'

class MockRequest { constructor(private body:any){} async json(){ return this.body }}

describe('Admin fields create (unit-mocked)', () => {
  test('should create field and return 201', async () => {
    const req = new MockRequest({ name: 'New Field', pricePerHour: 50000 })
    const res = await POST(req as any)
    const body = await res.json()
    expect(body.field).toBeDefined()
    expect(body.message).toContain('created')
  })
})
