import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password harus diisi' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email_user: email },
      select: {
        id_user: true,
        nama_user: true,
        email_user: true,
        phone_user: true,
        password: true,
        role: true,
        isActive: true,
        user_dibuat_pada: true,
        user_diupdate_pada: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Akun Anda tidak aktif. Silakan hubungi administrator.' },
        { status: 403 }
      )
    }

    const token = jwt.sign(
      { userId: user.id_user, email: user.email_user, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    const { password: _, ...userWithoutPassword } = user

    // Map to frontend-friendly format for backward compatibility
    const mappedUser = {
      id: user.id_user,
      id_user: user.id_user,
      name: user.nama_user,
      nama_user: user.nama_user,
      email: user.email_user,
      email_user: user.email_user,
      phone: user.phone_user,
      phone_user: user.phone_user,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.user_dibuat_pada.toISOString(),
      updatedAt: user.user_diupdate_pada.toISOString()
    }

    const response = NextResponse.json({
      message: 'Login berhasil',
      user: mappedUser,
      token: token
    })

    // Set cookie with proper configuration
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax' for better redirect support
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Error logging in user:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
