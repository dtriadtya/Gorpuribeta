import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { authenticateRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { userId, currentPassword, newPassword } = await request.json()

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id_user: userId },
      select: { id_user: true, password: true }
    })

    if (!user) {
      return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 })
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Password saat ini tidak valid' }, { status: 400 })
    }

    // Hash new password (using same rounds as register: 12)
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await prisma.user.update({
      where: { id_user: userId },
      data: { password: hashedPassword }
    })

    console.log(`✅ Password updated successfully for user ID: ${userId}`)

    return NextResponse.json({ message: 'Password berhasil diubah' })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat mengubah password' },
      { status: 500 }
    )
  }
}