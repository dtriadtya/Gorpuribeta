import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const auth = authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const reservations = await prisma.reservation.findMany({
      include: {
        user: {
          select: {
            id_user: true,
            nama_user: true,
            email_user: true,
            phone_user: true
          }
        },
        lapangan: {
          select: {
            id_lapangan: true,
            nama_lapangan: true
          }
        },
        // @ts-ignore newly added relation until Prisma client regenerated
        validator_lunas: { select: { id_user: true, nama_user: true, email_user: true } },
        // @ts-ignore newly added relation until Prisma client regenerated
        validator_dp: { select: { id_user: true, nama_user: true, email_user: true } },
        // @ts-ignore newly added relation until Prisma client regenerated
        validator_pelunasan: { select: { id_user: true, nama_user: true, email_user: true } }
      },
      orderBy: [
        { tanggal_reservasi: 'desc' },
        { jam_mulai_reservasi: 'desc' }
      ]
    })
    
    // Convert Decimal to number and map field names for frontend
    const formattedReservations = (reservations as any[]).map((reservation: any) => ({
      id: reservation.id_reservasi,
      user_id: reservation.id_user,
      field_id: reservation.id_lapangan,
      field_name: reservation.lapangan?.nama_lapangan,
      reservation_date: reservation.tanggal_reservasi.toISOString(),
      start_time: reservation.jam_mulai_reservasi,
      end_time: reservation.jam_selesai_reservasi,
      total_price: Number(reservation.total_harga),
      status: reservation.status_reservasi,
      payment_status: reservation.status_pembayaran,
      payment_type: reservation.tipe_pembayaran ?? null,
      payment_amount: reservation.paymentAmount != null ? Number(reservation.paymentAmount) : null,
      payment_proof: reservation.bukti_lunas,
      dp_proof: reservation.bukti_dp,
      pelunasan_proof: reservation.bukti_pelunasan,
      payment_notes: reservation.paymentNotes,
      dp_sender_account_name: reservation.nama_rekening_dp,
      pelunasan_sender_account_name: reservation.nama_rekening_pelunasan,
      dpSenderAccountName: reservation.nama_rekening_dp,
      pelunasanSenderAccountName: reservation.nama_rekening_pelunasan,
      notes: reservation.notes,
      payment_validated_by: reservation.validasi_lunas_oleh ?? null,
      payment_validated_at: reservation.paymentValidatedAt ? reservation.paymentValidatedAt.toISOString() : null,
      payment_validated_admin: (reservation as any).validator_lunas ? {
        id: (reservation as any).validator_lunas.id_user,
        name: (reservation as any).validator_lunas.nama_user,
        email: (reservation as any).validator_lunas.email_user
      } : null,
      dp_validated_by: reservation.validasi_dp_oleh ?? null,
      dp_validated_at: reservation.dpValidatedAt ? reservation.dpValidatedAt.toISOString() : null,
      dp_validated_admin: (reservation as any).validator_dp ? {
        id: (reservation as any).validator_dp.id_user,
        name: (reservation as any).validator_dp.nama_user,
        email: (reservation as any).validator_dp.email_user
      } : null,
      pelunasan_validated_by: reservation.validasi_pelunasan_oleh ?? null,
      pelunasan_validated_at: reservation.pelunasanValidatedAt ? reservation.pelunasanValidatedAt.toISOString() : null,
      pelunasan_validated_admin: (reservation as any).validator_pelunasan ? {
        id: (reservation as any).validator_pelunasan.id_user,
        name: (reservation as any).validator_pelunasan.nama_user,
        email: (reservation as any).validator_pelunasan.email_user
      } : null,
      created_at: reservation.reservasi_dibuat_pada.toISOString(),
      updated_at: reservation.reservasi_diupdate_pada.toISOString(),
      user: {
        id: reservation.user.id_user,
        name: reservation.user.nama_user,
        email: reservation.user.email_user,
        phone: reservation.user.phone_user
      },
      field: {
        id: reservation.lapangan.id_lapangan,
        name: reservation.lapangan.nama_lapangan
      }
    }))
    
    return NextResponse.json({ reservations: formattedReservations })
  } catch (error) {
    console.error('Error fetching admin reservations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
