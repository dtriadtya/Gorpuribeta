import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token tidak ditemukan' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    // Decode token tanpa verify sessionToken (untuk token lama)
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret',
      { ignoreExpiration: false }
    ) as any

    console.log(`🔄 Refreshing token for user ${decoded.userId}`)
    console.log(`  Has sessionToken in JWT?`, !!decoded.sessionToken)

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

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Akun tidak aktif' },
        { status: 403 }
      )
    }

    // Generate new session token
    const newSessionToken = crypto.randomBytes(32).toString('hex')

    console.log(`✅ New session token generated for ${user.email_user}`)

    // Create new JWT with session token
    const newToken = jwt.sign(
      {
        userId: user.id_user,
        email: user.email_user,
        role: user.role,
        sessionToken: newSessionToken,
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      message: 'Token berhasil diperbarui',
      token: newToken,
      user: user,
    })
  } catch (error) {
    console.error('Error refreshing token:', error)
    
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Token tidak valid' },
      { status: 401 }
    )
  }
}
