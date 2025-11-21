import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reservationId = params.id
    
    const reservation = await prisma.reservation.findUnique({
      where: { id_reservasi: parseInt(reservationId) },
      include: {
        user: {
          select: {
            id_user: true,
            nama_user: true,
            email_user: true
          }
        },
        lapangan: {
          select: {
            id_lapangan: true,
            nama_lapangan: true,
            harga_per_jam: true
          }
        }
      }
    })
    
    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }
    
    return NextResponse.json({ reservation })
  } catch (error) {
    console.error('Error fetching reservation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reservationId = params.id
    const body = await request.json()
    const { status, payment_status, notes } = body
    
    // Validate status values
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed']
    const validPaymentStatuses = ['pending', 'paid', 'refunded']
    
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }
    
    if (payment_status && !validPaymentStatuses.includes(payment_status)) {
      return NextResponse.json(
        { error: 'Invalid payment status value' },
        { status: 400 }
      )
    }
    
    // Build update data object
    const updateData: any = {}
    
    if (status !== undefined) {
      updateData.status_reservasi = status.toUpperCase()
    }
    
    if (payment_status !== undefined) {
      updateData.status_pembayaran = payment_status.toUpperCase()
    }
    
    if (notes !== undefined) {
      updateData.notes = notes
    }
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }
    
    const reservation = await prisma.reservation.update({
      where: { id_reservasi: parseInt(reservationId) },
      data: updateData
    })
    
    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      message: 'Reservation updated successfully'
    })
  } catch (error) {
    console.error('Error updating reservation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const auth = authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const reservationId = params.id
    
    const reservation = await prisma.reservation.delete({
      where: { id_reservasi: parseInt(reservationId) }
    })
    
    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      message: 'Reservation deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting reservation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
