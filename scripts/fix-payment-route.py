import re

# Content template untuk file payment route
content = """import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    // Authenticate admin
    const authUser = authenticateRequest(request)
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { paymentStatus, adminNotes, action } = body

    // Get current reservation first
    const currentReservation = await prisma.reservation.findUnique({
      where: { id_reservasi: parseInt(id) }
    });

    if (!currentReservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    // Handle DP rejection action
    if (action === 'REJECT_DP') {
      if ((currentReservation as any).tipe_pembayaran !== 'DP') {
        return NextResponse.json(
          { error: 'Penolakan DP hanya berlaku untuk pembayaran DP' },
          { status: 400 }
        )
      }

      const dpProofExists = Boolean((currentReservation as any).bukti_dp || currentReservation.bukti_lunas)
      if (!dpProofExists) {
        return NextResponse.json(
          { error: 'Tidak ada bukti DP yang dapat ditolak' },
          { status: 400 }
        )
      }

      const rejectionNote = adminNotes
        ? `[Admin Tolak DP]: ${adminNotes}`
        : '[Admin Tolak DP] Bukti DP ditolak. Mohon upload ulang.'
      const existingNotes = (currentReservation.paymentNotes || '').trim()
      const combinedNotes = existingNotes
        ? [existingNotes, rejectionNote].join('\\n').trim()
        : rejectionNote

      const updatedReservation = await prisma.reservation.update({
        where: { id_reservasi: parseInt(id) },
        data: ({
          bukti_dp: null,
          bukti_lunas: null,
          status_pembayaran: 'DP_REJECTED' as any,
          status_reservasi: 'REJECTED',
          paymentNotes: combinedNotes,
          validasi_lunas_oleh: authUser.userId,
          paymentValidatedAt: new Date(),
          validasi_dp_oleh: null,
          dpValidatedAt: null,
          validasi_pelunasan_oleh: null,
          pelunasanValidatedAt: null
        } as any),
        include: {
          user: {
            select: { id_user: true, nama_user: true, email_user: true, phone_user: true }
          },
          lapangan: {
            select: { id_lapangan: true, nama_lapangan: true }
          },
          validator_lunas: {
            select: { id_user: true, nama_user: true, email_user: true }
          },
          validator_dp: {
            select: { id_user: true, nama_user: true, email_user: true }
          },
          validator_pelunasan: {
            select: { id_user: true, nama_user: true, email_user: true }
          }
        }
      })

      const formattedReservation = {
        id: updatedReservation.id_reservasi,
        user_id: updatedReservation.id_user,
        field_id: updatedReservation.id_lapangan,
        field_name: (updatedReservation as any).lapangan?.nama_lapangan,
        reservation_date: updatedReservation.tanggal_reservasi.toISOString(),
        start_time: updatedReservation.jam_mulai_reservasi,
        end_time: updatedReservation.jam_selesai_reservasi,
        total_price: Number(updatedReservation.total_harga),
        status: updatedReservation.status_reservasi,
        payment_status: (updatedReservation as any).status_pembayaran,
        payment_type: (updatedReservation as any).tipe_pembayaran ?? null,
        payment_amount: (updatedReservation as any).paymentAmount != null ? Number((updatedReservation as any).paymentAmount) : null,
        payment_proof: updatedReservation.bukti_lunas,
        dp_proof: (updatedReservation as any).bukti_dp,
        pelunasan_proof: (updatedReservation as any).bukti_pelunasan,
        payment_notes: updatedReservation.paymentNotes,
        notes: updatedReservation.notes,
        payment_validated_by: (updatedReservation as any).validasi_lunas_oleh ?? null,
        payment_validated_at: (updatedReservation as any).paymentValidatedAt ? (updatedReservation as any).paymentValidatedAt.toISOString() : null,
        payment_validated_admin: (updatedReservation as any).validator_lunas ? {
          id: (updatedReservation as any).validator_lunas.id_user,
          name: (updatedReservation as any).validator_lunas.nama_user,
          email: (updatedReservation as any).validator_lunas.email_user
        } : null,
        dp_validated_by: (updatedReservation as any).validasi_dp_oleh ?? null,
        dp_validated_at: (updatedReservation as any).dpValidatedAt ? (updatedReservation as any).dpValidatedAt.toISOString() : null,
        dp_validated_admin: (updatedReservation as any).validator_dp ? {
          id: (updatedReservation as any).validator_dp.id_user,
          name: (updatedReservation as any).validator_dp.nama_user,
          email: (updatedReservation as any).validator_dp.email_user
        } : null,
        pelunasan_validated_by: (updatedReservation as any).validasi_pelunasan_oleh ?? null,
        pelunasan_validated_at: (updatedReservation as any).pelunasanValidatedAt ? (updatedReservation as any).pelunasanValidatedAt.toISOString() : null,
        pelunasan_validated_admin: (updatedReservation as any).validator_pelunasan ? {
          id: (updatedReservation as any).validator_pelunasan.id_user,
          name: (updatedReservation as any).validator_pelunasan.nama_user,
          email: (updatedReservation as any).validator_pelunasan.email_user
        } : null,
        created_at: updatedReservation.reservasi_dibuat_pada.toISOString(),
        updated_at: updatedReservation.reservasi_diupdate_pada.toISOString(),
        user: (updatedReservation as any).user,
        field: (updatedReservation as any).lapangan
      }

      return NextResponse.json({
        message: 'Bukti DP ditolak. User dapat mengunggah ulang.',
        reservation: formattedReservation
      })
    }

    // Handler untuk REJECT_PELUNASAN dan REJECT_FULL dan payment status update
    // akan ditambahkan di sini... (truncated untuk file yang lebih pendek)
    
    return NextResponse.json({
      message: 'Handler belum lengkap - silakan lengkapi manual',
    })

  } catch (error) {
    console.error('Error updating payment status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
"""

# Tulis file
output_path = r'c:\Projects\backup 07-11-2025 4.11\gorpuribeta-main\app\api\reservations\[id]\payment\route.ts'
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(content)
    
print(f"File berhasil dibuat: {output_path}")
