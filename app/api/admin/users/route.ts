import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { authenticateRequest } from '@/lib/auth'

// GET - Fetch all users with pagination and search
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const auth = authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const whereClause: any = {}
    
    if (search) {
      whereClause.OR = [
        { nama_user: { contains: search, mode: 'insensitive' } },
        { email_user: { contains: search, mode: 'insensitive' } },
        { phone_user: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (role) {
      whereClause.role = role
    }

    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
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
        orderBy: { user_dibuat_pada: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where: whereClause })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    // Map to frontend-friendly format for backward compatibility
    const mappedUsers = users.map((user: any) => ({
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

    return NextResponse.json({
      users: mappedUsers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const auth = authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, phone, role = 'USER', password } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email_user: email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        nama_user: name,
        email_user: email,
        phone_user: phone || null,
        role: role as 'USER' | 'ADMIN',
        password: hashedPassword,
        isActive: true
      },
      select: {
        id_user: true,
        nama_user: true,
        email_user: true,
        phone_user: true,
        role: true,
        isActive: true,
        user_dibuat_pada: true,
        user_diupdate_pada: true
      }
    })

    // Map to frontend-friendly format
    const mappedUser = {
      id: user.id_user,
      name: user.nama_user,
      email: user.email_user,
      phone: user.phone_user,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.user_dibuat_pada.toISOString(),
      updatedAt: user.user_diupdate_pada.toISOString()
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: mappedUser
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
