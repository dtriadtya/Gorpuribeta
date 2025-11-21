import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id_user: true,
        nama_user: true,
        email_user: true,
        phone_user: true,
        role: true,
        isActive: true,
        user_dibuat_pada: true,
        user_diupdate_pada: true,
        _count: {
          select: {
            reservasi: true
          }
        }
      },
      orderBy: { user_dibuat_pada: 'desc' }
    })
    
    // Map to frontend-friendly format for backward compatibility
    const mappedUsers = users.map(user => ({
      id: user.id_user,
      name: user.nama_user,
      email: user.email_user,
      phone: user.phone_user,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.user_dibuat_pada.toISOString(),
      updatedAt: user.user_diupdate_pada.toISOString(),
      _count: user._count
    }))
    
    return NextResponse.json({ users: mappedUsers })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
