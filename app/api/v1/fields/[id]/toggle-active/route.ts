import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fieldId = parseInt(params.id)
    
    const field = await prisma.field.findUnique({
      where: { id_lapangan: fieldId }
    })
    
    if (!field) {
      return NextResponse.json(
        { error: 'Field not found' },
        { status: 404 }
      )
    }
    
    const updatedField = await prisma.field.update({
      where: { id_lapangan: fieldId },
      data: { isActive: !field.isActive }
    })
    
    return NextResponse.json({
      message: `Field ${updatedField.isActive ? 'activated' : 'deactivated'} successfully`,
      field: {
        id: updatedField.id_lapangan,
        isActive: updatedField.isActive
      }
    })
  } catch (error) {
    console.error('Error toggling field active status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}