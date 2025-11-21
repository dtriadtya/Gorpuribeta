import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fieldId = searchParams.get('id')
    
    if (fieldId) {
      // Get single field
      const field = await prisma.field.findFirst({
        where: {
          id_lapangan: parseInt(fieldId),
          isActive: true
        }
      })
      
      if (!field) {
        return NextResponse.json({ error: 'Field not found' }, { status: 404 })
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
    } else {
      // Get all fields with minimal data for better performance
      const fields = await prisma.field.findMany({
        where: { isActive: true },
        select: {
          id_lapangan: true,
          nama_lapangan: true,
          deskripsi: true,
          harga_per_jam: true,
          imageUrl: true,
          fasilitas: true,
          isActive: true
          // Exclude createdAt and updatedAt for better performance
        },
        orderBy: { lapangan_dibuat_pada: 'desc' }
      })
      
      // Convert Decimal to number for frontend
      const formattedFields = fields.map((field: any) => ({
        id: field.id_lapangan,
        name: field.nama_lapangan,
        description: field.deskripsi,
        price_per_hour: Number(field.harga_per_jam),
        image_url: field.imageUrl,
        facilities: field.fasilitas,
        isActive: field.isActive
      }))
      
      return NextResponse.json({ fields: formattedFields })
    }
  } catch (error) {
    console.error('Error fetching fields:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, price_per_hour, image_url, facilities } = body
    
    // Validate required fields
    if (!name || !price_per_hour) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const field = await prisma.field.create({
      data: {
        nama_lapangan: name,
        deskripsi: description,
        harga_per_jam: price_per_hour,
        imageUrl: image_url,
        fasilitas: facilities || []
      }
    })
    
    return NextResponse.json({
      message: 'Field created successfully',
      fieldId: field.id_lapangan
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating field:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}