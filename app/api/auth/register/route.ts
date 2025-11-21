import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, phone } = body

    // Validasi dasar
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nama, email, dan password wajib diisi' },
        { status: 400 }
      )
    }

    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      )
    }

    // Validasi password
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      )
    }

    // Cek user existing
    const existingUser = await prisma.user.findUnique({
      where: { email_user: email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Simpan user baru
    const user = await prisma.user.create({
      data: {
        nama_user: name,
        email_user: email,
        password: hashedPassword,
        phone_user: phone || null,
        role: 'USER',
      },
    })

    // Buat JWT token
    const token = jwt.sign(
      {
        userId: user.id_user,
        email: user.email_user,
        role: user.role,
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

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

    // Kirim cookie dan token dalam response body
    const response = NextResponse.json({
      message: 'Pendaftaran berhasil',
      user: mappedUser,
      token: token
    })

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    })

    return response
  } catch (error) {
    console.error('Error registering user:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}
