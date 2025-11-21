import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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
    const { isActive } = body

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'Invalid isActive status' }, { status: 400 })
    }

    const field = await prisma.field.findUnique({
      where: { id_lapangan: parseInt(id) }
    })

    if (!field) {
      return NextResponse.json({ error: 'Field not found' }, { status: 404 })
    }

    const updatedField = await prisma.field.update({
      where: { id_lapangan: parseInt(id) },
      data: { isActive },
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

    return NextResponse.json({
      message: `Field ${isActive ? 'activated' : 'deactivated'} successfully`,
      field: updatedField
    })
  } catch (error) {
    console.error('Error toggling field active status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



