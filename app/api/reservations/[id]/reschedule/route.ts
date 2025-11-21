import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate admin
    const authResult = await authenticateRequest(request)
    if (!authResult || authResult.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const reservationId = parseInt(params.id)
    const body = await request.json()
    const { newDate, newStartTime, newEndTime, adminNotes } = body

    if (!newDate || !newStartTime || !newEndTime) {
      return NextResponse.json(
        { error: 'Missing required fields: newDate, newStartTime, newEndTime' },
        { status: 400 }
      )
    }

    // Get existing reservation
    const existingReservation = await prisma.reservation.findUnique({
      where: { id_reservasi: reservationId },
      include: {
        lapangan: true,
        user: true
      }
    })

    if (!existingReservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      )
    }

    // Check if field is available for the new time slot
    const conflictingReservation = await prisma.reservation.findFirst({
      where: {
        id_lapangan: existingReservation.id_lapangan,
        tanggal_reservasi: new Date(newDate),
        id_reservasi: { not: reservationId }, // Exclude current reservation
  // Use string literals for new enum values and cast to any to avoid
  // TypeScript errors if generated Prisma client types are out of sync.
  status_reservasi: { in: ['PENDING', 'DP_PAID'] as any },
        OR: [
          {
            AND: [
              { jam_mulai_reservasi: { lte: newStartTime } },
              { jam_selesai_reservasi: { gt: newStartTime } }
            ]
          },
          {
            AND: [
              { jam_mulai_reservasi: { lt: newEndTime } },
              { jam_selesai_reservasi: { gte: newEndTime } }
            ]
          },
          {
            AND: [
              { jam_mulai_reservasi: { gte: newStartTime } },
              { jam_selesai_reservasi: { lte: newEndTime } }
            ]
          }
        ]
      }
    })

    if (conflictingReservation) {
      return NextResponse.json(
        { error: 'Jadwal baru bentrok dengan booking lain' },
        { status: 409 }
      )
    }

    // Update reservation with new schedule
    const updatedReservation = await prisma.reservation.update({
      where: { id_reservasi: reservationId },
      data: {
        tanggal_reservasi: new Date(newDate),
        jam_mulai_reservasi: newStartTime,
        jam_selesai_reservasi: newEndTime,
        notes: adminNotes || existingReservation.notes,
        reservasi_diupdate_pada: new Date()
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

    return NextResponse.json({
      message: 'Reschedule berhasil',
      reservation: {
        ...updatedReservation,
        field_name: updatedReservation.lapangan.nama_lapangan,
        payment_validated_admin: null
      }
    })
  } catch (error) {
    console.error('Error rescheduling reservation:', error)
    return NextResponse.json(
      { error: 'Failed to reschedule reservation' },
      { status: 500 }
    )
  }
}
