import { NextRequest, NextResponse } from 'next/server'
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
        ? [existingNotes, rejectionNote].join('\n').trim()
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

    // Handle pelunasan rejection action
    if (action === 'REJECT_PELUNASAN') {
      if ((currentReservation as any).tipe_pembayaran !== 'DP') {
        return NextResponse.json(
          { error: 'Penolakan pelunasan hanya berlaku untuk pembayaran DP' },
          { status: 400 }
        )
      }

      if (!(currentReservation as any).bukti_pelunasan) {
        return NextResponse.json(
          { error: 'Tidak ada bukti pelunasan yang dapat ditolak' },
          { status: 400 }
        )
      }

      const rejectionNote = adminNotes
        ? `[Admin Tolak Pelunasan]: ${adminNotes}`
        : '[Admin Tolak Pelunasan] Bukti pelunasan ditolak. Mohon upload ulang.'
      const existingNotes = (currentReservation.paymentNotes || '').trim()
      const combinedNotes = existingNotes
        ? [existingNotes, rejectionNote].join('\n').trim()
        : rejectionNote

      const updatedReservation = await prisma.reservation.update({
        where: { id_reservasi: parseInt(id) },
        data: ({
          bukti_pelunasan: null,
          bukti_lunas: (currentReservation as any).bukti_dp || null,
          status_pembayaran: 'PELUNASAN_REJECTED' as any,
          status_reservasi: 'DP_PAID',
          paymentNotes: combinedNotes,
          validasi_lunas_oleh: authUser.userId,
          paymentValidatedAt: new Date(),
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
        message: 'Bukti pelunasan ditolak. User dapat mengunggah ulang.',
        reservation: formattedReservation
      })
    }

    // Handle FULL payment rejection action
    if (action === 'REJECT_FULL') {
      if ((currentReservation as any).tipe_pembayaran !== 'FULL') {
        return NextResponse.json(
          { error: 'Penolakan pembayaran penuh hanya berlaku untuk metode pembayaran Lunas' },
          { status: 400 }
        )
      }

      const fullProofExists = Boolean((currentReservation as any).bukti_lunas)
      if (!fullProofExists) {
        return NextResponse.json(
          { error: 'Tidak ada bukti pembayaran yang dapat ditolak' },
          { status: 400 }
        )
      }

      const rejectionNote = adminNotes
        ? `[Admin Tolak Pembayaran]: ${adminNotes}`
        : '[Admin Tolak Pembayaran] Bukti pembayaran ditolak. Booking dibatalkan, silakan reservasi ulang.'
      const existingNotes = (currentReservation.paymentNotes || '').trim()
      const combinedNotes = existingNotes
        ? [existingNotes, rejectionNote].join('\n').trim()
        : rejectionNote

      const updatedReservation = await prisma.reservation.update({
        where: { id_reservasi: parseInt(id) },
        data: ({
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
        payment_proof: (updatedReservation as any).bukti_lunas,
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
        message: 'Bukti pembayaran ditolak. Booking telah dibatalkan.',
        reservation: formattedReservation
      })
    }

    // Handle payment status update
    const allowedStatuses = ['PENDING', 'DP_PAID', 'PAID', 'REFUNDED']
    if (!paymentStatus || !allowedStatuses.includes(paymentStatus)) {
      return NextResponse.json(
        { error: 'Invalid payment status' },
        { status: 400 }
      )
    }

    if (paymentStatus === 'DP_PAID' && (currentReservation as any).tipe_pembayaran !== 'DP') {
      return NextResponse.json(
        { error: 'DP_PAID hanya berlaku untuk pembayaran DP' },
        { status: 400 }
      )
    }

    let updateData: any = {
      status_pembayaran: paymentStatus,
      paymentNotes: adminNotes ? 
        `${currentReservation.paymentNotes || ''}\n[Admin]: ${adminNotes}`.trim() : 
        currentReservation.paymentNotes,
      validasi_lunas_oleh: authUser.userId,
      paymentValidatedAt: new Date(),
    }

    if (paymentStatus === 'PAID') {
      updateData.status_reservasi = 'COMPLETED'
    } else if (paymentStatus === 'REFUNDED') {
      updateData.status_reservasi = 'CANCELLED'
    } else if (paymentStatus === 'DP_PAID') {
      updateData.status_reservasi = 'DP_PAID'
    }

    if (paymentStatus === 'DP_PAID') {
      updateData.validasi_dp_oleh = authUser.userId
      updateData.dpValidatedAt = new Date()
      updateData.validasi_pelunasan_oleh = null
      updateData.pelunasanValidatedAt = null
    }

    if (paymentStatus === 'PAID') {
      updateData.validasi_pelunasan_oleh = authUser.userId
      updateData.pelunasanValidatedAt = new Date()

      if ((currentReservation as any).tipe_pembayaran !== 'DP') {
        updateData.validasi_dp_oleh = authUser.userId
        updateData.dpValidatedAt = new Date()
      } else if (!(currentReservation as any).validasi_dp_oleh) {
        updateData.validasi_dp_oleh = authUser.userId
        updateData.dpValidatedAt = new Date()
      }
    }

    if (paymentStatus === 'REFUNDED') {
      updateData.validasi_pelunasan_oleh = null
      updateData.pelunasanValidatedAt = null
    }

    if (paymentStatus === 'PAID' && (currentReservation as any).tipe_pembayaran === 'DP') {
      updateData.paymentAmount = currentReservation.total_harga
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id_reservasi: parseInt(id) },
      data: updateData,
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
      payment_amount:
        (updatedReservation as any).paymentAmount != null
          ? Number((updatedReservation as any).paymentAmount)
          : null,
      payment_proof: (updatedReservation as any).bukti_lunas,
      dp_proof: (updatedReservation as any).bukti_dp,
      pelunasan_proof: (updatedReservation as any).bukti_pelunasan,
      payment_notes: updatedReservation.paymentNotes,
      notes: updatedReservation.notes,
      payment_validated_by: (updatedReservation as any).validasi_lunas_oleh ?? null,
      payment_validated_at: (updatedReservation as any).paymentValidatedAt
        ? (updatedReservation as any).paymentValidatedAt.toISOString()
        : null,
      payment_validated_admin: (updatedReservation as any).validator_lunas
        ? {
            id: (updatedReservation as any).validator_lunas.id_user,
            name: (updatedReservation as any).validator_lunas.nama_user,
            email: (updatedReservation as any).validator_lunas.email_user
          }
        : null,
      dp_validated_by: (updatedReservation as any).validasi_dp_oleh ?? null,
      dp_validated_at: (updatedReservation as any).dpValidatedAt
        ? (updatedReservation as any).dpValidatedAt.toISOString()
        : null,
      dp_validated_admin: (updatedReservation as any).validator_dp
        ? {
            id: (updatedReservation as any).validator_dp.id_user,
            name: (updatedReservation as any).validator_dp.nama_user,
            email: (updatedReservation as any).validator_dp.email_user
          }
        : null,
      pelunasan_validated_by: (updatedReservation as any).validasi_pelunasan_oleh ?? null,
      pelunasan_validated_at: (updatedReservation as any).pelunasanValidatedAt
        ? (updatedReservation as any).pelunasanValidatedAt.toISOString()
        : null,
      pelunasan_validated_admin: (updatedReservation as any).validator_pelunasan
        ? {
            id: (updatedReservation as any).validator_pelunasan.id_user,
            name: (updatedReservation as any).validator_pelunasan.nama_user,
            email: (updatedReservation as any).validator_pelunasan.email_user
          }
        : null,
      created_at: updatedReservation.reservasi_dibuat_pada.toISOString(),
      updated_at: updatedReservation.reservasi_diupdate_pada.toISOString(),
      user: (updatedReservation as any).user,
      field: (updatedReservation as any).lapangan
    }

    return NextResponse.json({
      message: 'Payment status updated successfully',
      reservation: formattedReservation
    })

  } catch (error) {
    console.error('Error updating payment status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}