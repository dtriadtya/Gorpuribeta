jest.mock('@/lib/prisma', () => ({
  prisma: {
    member: {
      create: jest.fn().mockResolvedValue({ id_member: 7, nama_member: 'Member A', kontak_member: 'Kontak', id_lapangan: 1, dayOfWeek: 'MONDAY', jam_mulai_member: '08:00', jam_selesai_member: '09:00', jenis_paket_member: 'MONTHLY_1', tanggal_mulai_member: new Date(), tanggal_berakhir_member: new Date(), member_dibuat_pada: new Date(), member_diupdate_pada: new Date(), lapangan: { id_lapangan: 1, nama_lapangan: 'Lapangan A', harga_per_jam: 50000 } })
    },
    lapangan: {
      select: jest.fn()
    }
  }
}))

import { POST } from '@/app/api/admin/members/route'

class MockRequest { constructor(private body:any){} async json(){ return this.body }}

describe('Admin members create (unit-mocked)', () => {
  test('should create member schedules', async () => {
    const req = new MockRequest({ name: 'Member A', contactName: 'Kontak', fieldId: 1, schedules: [{ dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '09:00' }], packageType: 'MONTHLY_1' })
    const res = await POST(req as any)
    const body = await res.json()
    expect(Array.isArray(body.members)).toBe(true)
  })
})
