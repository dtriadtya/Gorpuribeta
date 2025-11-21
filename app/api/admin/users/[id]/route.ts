import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { authenticateRequest } from '@/lib/auth'

// GET - Get single user
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin authentication
    const auth = authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { id } = params

    const user = await prisma.user.findUnique({
      where: { id_user: parseInt(id) },
      select: {
        id_user: true,
        nama_user: true,
        email_user: true,
        phone_user: true,
        role: true,
        user_dibuat_pada: true,
        user_diupdate_pada: true,
        _count: {
          select: {
            reservasi: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Map to frontend-friendly format
    const mappedUser = {
      id: user.id_user,
      name: user.nama_user,
      email: user.email_user,
      phone: user.phone_user,
      role: user.role,
      createdAt: user.user_dibuat_pada.toISOString(),
      updatedAt: user.user_diupdate_pada.toISOString(),
      _count: user._count
    }

    return NextResponse.json({ user: mappedUser })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update user
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin authentication
    const auth = authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()
    const { name, email, phone, role, password } = body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id_user: parseInt(id) }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if email is being changed and if it already exists
    if (email && email !== existingUser.email_user) {
      const emailExists = await prisma.user.findUnique({
        where: { email_user: email }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      ...(name && { nama_user: name }),
      ...(email && { email_user: email }),
      ...(phone !== undefined && { phone_user: phone || null }),
      ...(role && { role: role as 'USER' | 'ADMIN' })
    }

    // Hash password if provided (only if not empty)
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 12)
      updateData.password = hashedPassword
      console.log(`✅ Password updated for user ID: ${id}`)
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id_user: parseInt(id) },
      data: updateData,
      select: {
        id_user: true,
        nama_user: true,
        email_user: true,
        phone_user: true,
        role: true,
        user_dibuat_pada: true,
        user_diupdate_pada: true
      }
    })

    // Map to frontend-friendly format
    const mappedUser = {
      id: updatedUser.id_user,
      name: updatedUser.nama_user,
      email: updatedUser.email_user,
      phone: updatedUser.phone_user,
      role: updatedUser.role,
      createdAt: updatedUser.user_dibuat_pada.toISOString(),
      updatedAt: updatedUser.user_diupdate_pada.toISOString()
    }

    return NextResponse.json({
      message: 'User updated successfully',
      user: mappedUser
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id_user: parseInt(id) }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has reservations
    const reservationCount = await prisma.reservation.count({
      where: { id_user: parseInt(id) }
    })

    if (reservationCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete user with existing reservations' },
        { status: 400 }
      )
    }

    // Delete user
    await prisma.user.delete({
      where: { id_user: parseInt(id) }
    })

    return NextResponse.json({
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
