import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fieldId = parseInt(params.id)

    const field = await prisma.field.findFirst({
      where: {
        id_lapangan: fieldId,
        isActive: true
      }
    })

    if (!field) {
      return NextResponse.json(
        { error: 'Field not found' },
        { status: 404 }
      )
    }

    // Convert Decimal to number for frontend
    const formattedField = {
      id: field.id_lapangan,
      name: field.nama_lapangan,
      description: field.deskripsi,
      price_per_hour: Number(field.harga_per_jam),
      image_url: field.imageUrl,
      facilities: field.fasilitas,
      isActive: field.isActive,
      createdAt: field.lapangan_dibuat_pada.toISOString(),
      updatedAt: field.lapangan_diupdate_pada.toISOString()
    }

    return NextResponse.json({ field: formattedField })
  } catch (error) {
    console.error('Error fetching field:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fieldId = parseInt(params.id)
    const body = await request.json()
    
    const { name, description, price_per_hour, image_url, facilities } = body
    
    // Validate required fields
    if (!name || !price_per_hour) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const updatedField = await prisma.field.update({
      where: { id_lapangan: fieldId },
      data: {
        nama_lapangan: name,
        deskripsi: description,
        harga_per_jam: price_per_hour,
        imageUrl: image_url,
        fasilitas: facilities || []
      }
    })
    
    return NextResponse.json({
      message: 'Field updated successfully',
      field: {
        id: updatedField.id_lapangan,
        name: updatedField.nama_lapangan,
        description: updatedField.deskripsi,
        price_per_hour: Number(updatedField.harga_per_jam),
        image_url: updatedField.imageUrl,
        facilities: updatedField.fasilitas,
        isActive: updatedField.isActive
      }
    })
  } catch (error) {
    console.error('Error updating field:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fieldId = parseInt(params.id)
    
    await prisma.field.delete({
      where: { id_lapangan: fieldId }
    })
    
    return NextResponse.json({
      message: 'Field deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting field:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}