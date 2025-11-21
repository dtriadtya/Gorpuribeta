jest.mock('@/lib/prisma', () => ({
  prisma: {
    field: {
      findFirst: jest.fn().mockResolvedValue({ id_lapangan: 1, nama_lapangan: 'Lapangan A', harga_per_jam: 100000, imageUrl: null, deskripsi: 'desc', isActive: true })
    },
    member: {
      findMany: jest.fn().mockResolvedValue([])
    },
    reservation: {
      findMany: jest.fn().mockResolvedValue([])
    }
  }
}))

import { GET } from '@/app/api/schedule/route'

class MockReq { url: string; constructor(url:string){ this.url = url }}

describe('Schedule handler (unit-mocked)', () => {
  test('GET schedule returns success and schedule array', async () => {
    const req = new MockReq('http://localhost/api/schedule?fieldId=1')
    const res = await GET(req as any)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.schedule)).toBe(true)
  })
})
