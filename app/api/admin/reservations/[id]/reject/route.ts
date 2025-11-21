import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin only' },
        { status: 403 }
      )
    }

    const reservationId = parseInt(params.id)

    // Get reservation
    const reservation = await prisma.reservation.findUnique({
      where: { id_reservasi: reservationId }
    })

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      )
    }

    // Check if reservation can be rejected (not already REJECTED, CANCELLED, or COMPLETED)
    if ((reservation.status_reservasi as string) === 'REJECTED' || reservation.status_reservasi === 'CANCELLED' || reservation.status_reservasi === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Booking cannot be rejected in current status' },
        { status: 400 }
      )
    }

    // Update status to REJECTED
    const updatedReservation = await prisma.reservation.update({
      where: { id_reservasi: reservationId },
      data: {
        status_reservasi: 'REJECTED' as any
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Booking rejected successfully',
      reservation: updatedReservation
    })

  } catch (error) {
    console.error('Error rejecting reservation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
