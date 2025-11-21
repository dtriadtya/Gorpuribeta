import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

interface DecodedToken {
  userId: number
  email: string
  role: string
  iat: number
  exp: number
}

export async function validateSession(token: string): Promise<{ valid: boolean; reason?: string; user?: any }> {
  try {
    // Decode JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret'
    ) as DecodedToken

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id_user: decoded.userId },
      select: {
        id_user: true,
        nama_user: true,
        email_user: true,
        phone_user: true,
        role: true,
        isActive: true,
      },
    })

    // Check if user exists
    if (!user) {
      console.log(`❌ User tidak ditemukan dengan userId: ${decoded.userId}`)
      return { valid: false, reason: 'User tidak ditemukan' }
    }

    // Check if user is active
    if (!user.isActive) {
      console.log(`❌ User ${user.email_user} tidak aktif`)
      return { valid: false, reason: 'Akun tidak aktif' }
    }

    console.log(`✅ Session valid untuk user ${user.email_user}`)

    // Session is valid
    return { valid: true, user: user }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.log(`⏰ Token expired`)
      return { valid: false, reason: 'Token expired' }
    }
    if (error instanceof jwt.JsonWebTokenError) {
      console.log(`❌ Token tidak valid: ${error.message}`)
      return { valid: false, reason: 'Token tidak valid' }
    }
    console.error(`❌ Error validasi token:`, error)
    return { valid: false, reason: 'Error validasi token' }
  }
}
