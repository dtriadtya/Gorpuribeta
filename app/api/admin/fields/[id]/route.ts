import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

// GET - Get single field
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

    const field = await prisma.field.findUnique({
      where: { id_lapangan: parseInt(id) },
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
      }
    })

    if (!field) {
      return NextResponse.json(
        { error: 'Field not found' },
        { status: 404 }
      )
    }

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
      updatedAt: field.lapangan_diupdate_pada.toISOString(),
      _count: field._count
    }

    return NextResponse.json({ field: mappedField })
  } catch (error) {
    console.error('Error fetching field:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update field
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
    const { name, description, pricePerHour, imageUrl, facilities, isActive } = body

    if (!name || !pricePerHour) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const field = await prisma.field.findUnique({
      where: { id_lapangan: parseInt(id) }
    })

    if (!field) {
      return NextResponse.json(
        { error: 'Field not found' },
        { status: 404 }
      )
    }

    const updatedField = await prisma.field.update({
      where: { id_lapangan: parseInt(id) },
      data: {
        nama_lapangan: name,
        deskripsi: description || null,
        harga_per_jam: parseFloat(pricePerHour),
        imageUrl: imageUrl || null,
        fasilitas: facilities || [],
        isActive: isActive !== undefined ? isActive : field.isActive
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
      id: updatedField.id_lapangan,
      name: updatedField.nama_lapangan,
      description: updatedField.deskripsi,
      pricePerHour: Number(updatedField.harga_per_jam),
      imageUrl: updatedField.imageUrl,
      facilities: updatedField.fasilitas,
      isActive: updatedField.isActive,
      createdAt: updatedField.lapangan_dibuat_pada.toISOString(),
      updatedAt: updatedField.lapangan_diupdate_pada.toISOString()
    }

    return NextResponse.json({
      message: 'Field updated successfully',
      field: mappedField
    })
  } catch (error) {
    console.error('Error updating field:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete field
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const field = await prisma.field.findUnique({
      where: { id_lapangan: parseInt(id) },
      include: {
        _count: {
          select: { reservasi: true }
        }
      }
    })

    if (!field) {
      return NextResponse.json({ error: 'Field not found' }, { status: 404 })
    }

    if (field._count.reservasi > 0) {
      return NextResponse.json(
        { error: 'Cannot delete field with existing reservations' },
        { status: 400 }
      )
    }

    await prisma.field.delete({
      where: { id_lapangan: parseInt(id) }
    })

    return NextResponse.json({ message: 'Field deleted successfully' })
  } catch (error) {
    console.error('Error deleting field:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



