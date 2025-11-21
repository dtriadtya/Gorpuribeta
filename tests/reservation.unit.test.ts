jest.mock('@/lib/prisma', () => ({
  prisma: {
    field: { findFirst: jest.fn().mockResolvedValue({ id_lapangan: 1, isActive: true }) },
    reservation: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({
        id_reservasi: 10,
        id_user: 5,
        id_lapangan: 1,
        tanggal_reservasi: new Date(),
        jam_mulai_reservasi: '08:00',
        jam_selesai_reservasi: '09:00',
        total_harga: 100000,
        status_reservasi: 'PENDING',
        status_pembayaran: 'PENDING',
        tipe_pembayaran: 'FULL',
        paymentAmount: null,
        bukti_lunas: null,
        bukti_dp: null,
        bukti_pelunasan: null,
        paymentNotes: null,
        validasi_dp_oleh: null,
        dpValidatedAt: null,
        reservasi_dibuat_pada: new Date(),
        reservasi_diupdate_pada: new Date(),
        user: { id_user: 5, nama_user: 'Guest', email_user: 'g@ex.com', phone_user: '081' },
        lapangan: { id_lapangan: 1, nama_lapangan: 'Lap 1' }
      })
    },
    user: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id_user: 5, nama_user: 'Guest', email_user: 'g@ex.com' })
    }
  }
}))

import { POST } from '@/app/api/reservations/route'

class MockRequest { constructor(private body:any){} async json(){ return this.body }}

describe('Reservations create (unit-mocked)', () => {
  test('should create reservation successfully', async () => {
    const req = new MockRequest({ name: 'Guest', email: 'g@ex.com', phone: '081', field_id: 1, reservation_date: new Date().toISOString(), start_time: '08:00', end_time: '09:00', total_price: 100000 })
    const res = await POST(req as any)
    const body = await res.json()
    expect(body.reservation).toBeDefined()
    expect(body.message).toBeDefined()
  })
})
