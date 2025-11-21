import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File
    const reservationId = data.get('reservationId') as string
    const paymentNotes = data.get('paymentNotes') as string
    const dpSenderAccountName = data.get('dpSenderAccountName') as string
    const pelunasanSenderAccountName = data.get('pelunasanSenderAccountName') as string

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!reservationId) {
      return NextResponse.json({ error: 'Reservation ID is required' }, { status: 400 })
    }

    // Validate sender account name based on payment type
    if (!dpSenderAccountName && !pelunasanSenderAccountName) {
      return NextResponse.json({ error: 'Sender account name is required' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Check if reservation exists
    const reservation = await prisma.reservation.findUnique({
      where: { id_reservasi: parseInt(reservationId) }
    })

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const filename = `payment-${reservationId}-${timestamp}.${fileExtension}`
    const filePath = join(process.cwd(), 'public', 'uploads', 'payments', filename)

    // Create directory if it doesn't exist
    const fs = require('fs')
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'payments')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Save file
    await writeFile(filePath, buffer)

    // Generate public URL
    const paymentProofUrl = `/uploads/payments/${filename}`

    // Tentukan field mana yang akan diupdate berdasarkan payment_notes
    const isDpPayment = !paymentNotes?.toLowerCase().includes('pelunasan')
    const isPelunasanPayment = paymentNotes?.toLowerCase().includes('pelunasan')

    // Update reservation with payment proof
    const updateData: any = {
      paymentNotes: paymentNotes || null
    }

    // Simpan sender account name sesuai tipe pembayaran
    if (isPelunasanPayment && pelunasanSenderAccountName) {
      updateData.nama_rekening_pelunasan = pelunasanSenderAccountName
      updateData.bukti_pelunasan = paymentProofUrl
      updateData.status_pembayaran = 'PELUNASAN_SENT'
      updateData.status_reservasi = 'PELUNASAN_SENT'
    } else if (isDpPayment && dpSenderAccountName) {
      updateData.nama_rekening_dp = dpSenderAccountName
      updateData.bukti_dp = paymentProofUrl
      updateData.status_pembayaran = 'PENDING'
    } else {
      updateData.status_pembayaran = 'PENDING'
    }
    
    // Untuk backward compatibility, tetap update paymentProof
    updateData.bukti_lunas = paymentProofUrl

    const updatedReservation = await prisma.reservation.update({
      where: { id_reservasi: parseInt(reservationId) },
      data: updateData
    })

    return NextResponse.json({
      message: 'Payment proof uploaded successfully',
      paymentProof: paymentProofUrl,
      reservation: updatedReservation
    })

  } catch (error) {
    console.error('Error uploading payment proof:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
