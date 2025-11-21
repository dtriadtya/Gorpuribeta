import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSession } from '@/lib/validateSession'

export async function GET(request: NextRequest) {
  try {
    // Validate session - OPTIONAL untuk GET (read-only)
    const authHeader = request.headers.get('authorization')
    let authenticatedUserId: number | null = null
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const sessionCheck = await validateSession(token)
      
      if (sessionCheck.valid && sessionCheck.user) {
        authenticatedUserId = sessionCheck.user.id_user
      }
      // Jika invalid, tetap lanjut tanpa error
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const fieldId = searchParams.get('field_id')
    const date = searchParams.get('date')
    
    const whereClause: any = {}
    
    if (userId) {
      whereClause.id_user = parseInt(userId)
    }
    
    if (fieldId) {
      whereClause.id_lapangan = parseInt(fieldId)
    }
    
    if (date) {
      whereClause.tanggal_reservasi = new Date(date)
    }
    
    const reservations = await prisma.reservation.findMany({
      where: whereClause,
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
        validator_dp: { select: { id_user: true, nama_user: true, email_user: true } },
        // @ts-ignore newly added relation until Prisma client regenerated
        validator_pelunasan: { select: { id_user: true, nama_user: true, email_user: true } }
      },
      orderBy: [
        { tanggal_reservasi: 'desc' },
        { jam_mulai_reservasi: 'desc' }
      ]
    })
    
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
      notes: reservation.notes,
      created_at: reservation.reservasi_dibuat_pada.toISOString(),
      updated_at: reservation.reservasi_diupdate_pada.toISOString(),
      dpSenderAccountName: reservation.nama_rekening_dp,
      pelunasanSenderAccountName: reservation.nama_rekening_pelunasan,
      user: reservation.user
    }))
    
    return NextResponse.json({ reservations: formattedReservations })
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name,
      email,
      phone,
      field_id, 
      reservation_date, 
      start_time, 
      end_time, 
      total_price, 
      notes,
      payment_type,
      payment_amount
    } = body
    
    if (!name || !email || !phone || !field_id || !reservation_date || !start_time || !end_time || !total_price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const field = await prisma.field.findFirst({
      where: {
        id_lapangan: parseInt(field_id),
        isActive: true
      }
    })
    
    if (!field) {
      return NextResponse.json(
        { error: 'Field not found' },
        { status: 404 }
      )
    }
    
    const conflicts = await prisma.reservation.findFirst({
      where: {
        id_lapangan: parseInt(field_id),
        tanggal_reservasi: new Date(reservation_date),
        status_reservasi: {
          // cast to any to avoid transient TypeScript enum mismatch
          in: ['PENDING', 'DP_PAID'] as any
        },
        OR: [
          {
            AND: [
              { jam_mulai_reservasi: { lt: end_time } },
              { jam_selesai_reservasi: { gt: start_time } }
            ]
          }
        ]
      }
    })
    
    if (conflicts) {
      return NextResponse.json(
        { error: 'Time slot is already booked' },
        { status: 409 }
      )
    }
    
    let user = await prisma.user.findUnique({
      where: { email_user: email }
    })
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          nama_user: name,
          email_user: email,
          phone_user: phone,
          password: 'temp_password',
          role: 'USER'
        }
      })
    }
    
    // Determine payment type & amount
    const resolvedPaymentType = payment_type === 'DP' ? 'DP' : 'FULL'
    const numericTotalPrice = Number(total_price)
    const resolvedPaymentAmount = (() => {
      if (resolvedPaymentType === 'DP') {
        // Use provided amount or fallback to 50% of total
        const half = numericTotalPrice * 0.5
        const provided = Number(payment_amount)
        return isNaN(provided) || provided <= 0 ? half : provided
      }
      // FULL payment: if provided use it otherwise full total
      const provided = Number(payment_amount)
      return isNaN(provided) || provided <= 0 ? numericTotalPrice : provided
    })()

    const reservation = await prisma.reservation.create({
      data: {
        id_user: user.id_user,
        id_lapangan: parseInt(field_id),
        tanggal_reservasi: new Date(reservation_date),
        jam_mulai_reservasi: start_time,
        jam_selesai_reservasi: end_time,
        total_harga: numericTotalPrice,
        notes: notes || null,
  // @ts-ignore prisma client types may be stale until restart
        tipe_pembayaran: resolvedPaymentType,
  // @ts-ignore prisma client types may be stale until restart
        paymentAmount: resolvedPaymentAmount,
      },
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
        }
      }
    })
    
    const formattedReservation = {
      id: reservation.id_reservasi,
      user_id: reservation.id_user,
      field_id: reservation.id_lapangan,
      field_name: (reservation as any).lapangan?.nama_lapangan,
      reservation_date: reservation.tanggal_reservasi.toISOString(),
      start_time: reservation.jam_mulai_reservasi,
      end_time: reservation.jam_selesai_reservasi,
      total_price: Number(reservation.total_harga),
      status: reservation.status_reservasi,
      payment_status: reservation.status_pembayaran,
  payment_type: (reservation as any).tipe_pembayaran ?? null,
  payment_amount: (reservation as any).paymentAmount != null ? Number((reservation as any).paymentAmount) : null,
      payment_proof: reservation.bukti_lunas,
  dp_proof: (reservation as any).bukti_dp,
  pelunasan_proof: (reservation as any).bukti_pelunasan,
      payment_notes: reservation.paymentNotes,
        dp_validated_by: (reservation as any).validasi_dp_oleh ?? null,
        dp_validated_at: (reservation as any).dpValidatedAt ? (reservation as any).dpValidatedAt.toISOString() : null,
        dp_validated_admin: (reservation as any).validator_dp ? {
          id: (reservation as any).validator_dp.id_user,
          name: (reservation as any).validator_dp.nama_user,
          email: (reservation as any).validator_dp.email_user
        } : null,
        pelunasan_validated_by: (reservation as any).validasi_pelunasan_oleh ?? null,
        pelunasan_validated_at: (reservation as any).pelunasanValidatedAt ? (reservation as any).pelunasanValidatedAt.toISOString() : null,
        pelunasan_validated_admin: (reservation as any).validator_pelunasan ? {
          id: (reservation as any).validator_pelunasan.id_user,
          name: (reservation as any).validator_pelunasan.nama_user,
          email: (reservation as any).validator_pelunasan.email_user
        } : null,
      notes: reservation.notes,
      created_at: reservation.reservasi_dibuat_pada.toISOString(),
      updated_at: reservation.reservasi_diupdate_pada.toISOString(),
      user: (reservation as any).user
    }
    
    return NextResponse.json({
      message: 'Reservation created successfully',
      reservation: formattedReservation
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating reservation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}