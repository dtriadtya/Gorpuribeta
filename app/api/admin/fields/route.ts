import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

// GET - Fetch all fields with pagination and search
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
    const statusFilter = searchParams.get('status') || 'ALL'

    const skip = (page - 1) * limit

    const whereClause: any = {}

    if (search) {
      whereClause.OR = [
        { nama_lapangan: { contains: search, mode: 'insensitive' } },
        { deskripsi: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (statusFilter !== 'ALL') {
      whereClause.isActive = statusFilter === 'ACTIVE'
    }

    const [fields, totalCount] = await Promise.all([
      prisma.field.findMany({
        where: whereClause,
        select: {
          id_lapangan: true,
          nama_lapangan: true,
          deskripsi: true,
          harga_per_jam: true,
          imageUrl: true,
          fasilitas: true,
          isActive: true,
          lapangan_dibuat_pada: true,
          lapangan_diupdate_pada: true,
          _count: {
            select: {
              reservasi: true
            }
          }
        },
        orderBy: { lapangan_dibuat_pada: 'desc' },
        skip,
        take: limit
      }),
      prisma.field.count({ where: whereClause })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    // Map to frontend-friendly format for backward compatibility
    const mappedFields = fields.map((field: any) => ({
      id: field.id_lapangan,
      name: field.nama_lapangan,
      description: field.deskripsi,
      pricePerHour: Number(field.harga_per_jam),
      imageUrl: field.imageUrl,
      facilities: field.fasilitas,
      isActive: field.isActive,
      createdAt: field.lapangan_dibuat_pada.toISOString(),
      updatedAt: field.lapangan_diupdate_pada.toISOString(),
      _count: field._count
    }))

    return NextResponse.json({
      fields: mappedFields,
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
    console.error('Error fetching fields:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new field
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
    const { name, description, pricePerHour, imageUrl, facilities } = body

    if (!name || !pricePerHour) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const field = await prisma.field.create({
      data: {
        nama_lapangan: name,
        deskripsi: description || null,
        harga_per_jam: parseFloat(pricePerHour),
        imageUrl: imageUrl || null,
        fasilitas: facilities || [],
        isActive: true
      },
      select: {
        id_lapangan: true,
        nama_lapangan: true,
        deskripsi: true,
        harga_per_jam: true,
        imageUrl: true,
        fasilitas: true,
        isActive: true,
        lapangan_dibuat_pada: true,
        lapangan_diupdate_pada: true
      }
    })

    // Map to frontend-friendly format
    const mappedField = {
      id: field.id_lapangan,
      name: field.nama_lapangan,
      description: field.deskripsi,
      pricePerHour: Number(field.harga_per_jam),
      imageUrl: field.imageUrl,
      facilities: field.fasilitas,
      isActive: field.isActive,
      createdAt: field.lapangan_dibuat_pada.toISOString(),
      updatedAt: field.lapangan_diupdate_pada.toISOString()
    }

    return NextResponse.json({
      message: 'Field created successfully',
      field: mappedField
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating field:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


