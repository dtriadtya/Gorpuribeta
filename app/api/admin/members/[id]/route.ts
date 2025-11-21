import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

// GET single member
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const auth = authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const id = parseInt(params.id)
    
    const member = await prisma.member.findUnique({
      where: { id_member: id },
      include: {
        lapangan: true
      }
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Map response to old field names for backward compatibility
    const mappedMember = {
      id: member.id_member,
      name: member.nama_member,
      contactName: member.kontak_member,
      fieldId: member.id_lapangan,
      dayOfWeek: member.dayOfWeek,
      startTime: member.jam_mulai_member,
      endTime: member.jam_selesai_member,
      packageType: member.jenis_paket_member,
      startDate: member.tanggal_mulai_member.toISOString(),
      endDate: member.tanggal_berakhir_member.toISOString(),
      isActive: member.isActive,
      createdAt: member.member_dibuat_pada.toISOString(),
      updatedAt: member.member_diupdate_pada.toISOString(),
      field: {
        id: member.lapangan.id_lapangan,
        name: member.lapangan.nama_lapangan,
        pricePerHour: member.lapangan.harga_per_jam
      }
    }

    return NextResponse.json({ member: mappedMember })
  } catch (error) {
    console.error('Error fetching member:', error)
    return NextResponse.json(
      { error: 'Failed to fetch member' },
      { status: 500 }
    )
  }
}

// PUT update member
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const auth = authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const id = parseInt(params.id)
    const body = await request.json()
    const {
      name,
      contactName,
      fieldId,
      packageType,
      startDate,
      endDate
    } = body

    // Log untuk debugging
    console.log('Update member data:', { id, name, contactName, fieldId, packageType, startDate, endDate })

    // Convert fieldId to number jika masih string
    const fieldIdNumber = typeof fieldId === 'string' ? parseInt(fieldId) : fieldId

    // Validasi fieldId adalah number yang valid
    if (isNaN(fieldIdNumber)) {
      return NextResponse.json(
        { error: 'Invalid field ID' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = {
      nama_member: name,
      kontak_member: contactName,
      id_lapangan: fieldIdNumber
    }

    // Get current member data
    const currentMember = await prisma.member.findUnique({
      where: { id_member: id }
    }) as any

    // IMPORTANT: Only update startDate if explicitly provided
    // This preserves the original member registration date during extensions
    if (startDate) {
      updateData.tanggal_mulai_member = new Date(startDate)
    }

    // If endDate is explicitly provided (for extensions), use it directly
    if (endDate) {
      updateData.tanggal_berakhir_member = new Date(endDate)
      if (packageType) {
        updateData.jenis_paket_member = packageType
      }
    }
    // Otherwise, if packageType is being updated, calculate endDate from startDate
    else if (packageType) {
      updateData.jenis_paket_member = packageType
      
      // Use the startDate from updateData if provided, otherwise use existing
      const memberStartDate = updateData.tanggal_mulai_member || currentMember?.tanggal_mulai_member || new Date()
      const memberEndDate = new Date(memberStartDate)
      
      // Support new package types
      switch (packageType) {
        case 'MEMBER_1':
          memberEndDate.setMonth(memberEndDate.getMonth() + 1)
          break
        case 'MEMBER_2':
          memberEndDate.setMonth(memberEndDate.getMonth() + 2)
          break
        case 'MEMBER_3':
          memberEndDate.setMonth(memberEndDate.getMonth() + 3)
          break
        case 'MEMBER_4':
          memberEndDate.setMonth(memberEndDate.getMonth() + 4)
          break
        case 'MEMBER_5':
          memberEndDate.setMonth(memberEndDate.getMonth() + 5)
          break
        case 'MEMBER_6':
          memberEndDate.setMonth(memberEndDate.getMonth() + 6)
          break
        case 'MEMBER_PLUS':
          memberEndDate.setMonth(memberEndDate.getMonth() + 12)
          break
        // Legacy support
        case 'MONTHLY_1':
          memberEndDate.setMonth(memberEndDate.getMonth() + 1)
          break
        case 'MONTHLY_3':
          memberEndDate.setMonth(memberEndDate.getMonth() + 3)
          break
        case 'MONTHLY_6':
          memberEndDate.setMonth(memberEndDate.getMonth() + 6)
          break
        case 'MONTHLY_12':
          memberEndDate.setMonth(memberEndDate.getMonth() + 12)
          break
      }
      
      updateData.tanggal_berakhir_member = memberEndDate
    }

    const member = await prisma.member.update({
      where: { id_member: id },
      data: updateData as any,
      include: {
        lapangan: {
          select: {
            id_lapangan: true,
            nama_lapangan: true,
            harga_per_jam: true
          }
        }
      }
    })

    console.log('Member updated successfully:', member)

    // Map response to old field names for backward compatibility
    const mappedMember = {
      id: member.id_member,
      name: member.nama_member,
      contactName: member.kontak_member,
      fieldId: member.id_lapangan,
      dayOfWeek: member.dayOfWeek,
      startTime: member.jam_mulai_member,
      endTime: member.jam_selesai_member,
      packageType: member.jenis_paket_member,
      startDate: member.tanggal_mulai_member.toISOString(),
      endDate: member.tanggal_berakhir_member.toISOString(),
      isActive: member.isActive,
      createdAt: member.member_dibuat_pada.toISOString(),
      updatedAt: member.member_diupdate_pada.toISOString(),
      field: {
        id: member.lapangan.id_lapangan,
        name: member.lapangan.nama_lapangan,
        pricePerHour: member.lapangan.harga_per_jam
      }
    }

    return NextResponse.json({ member: mappedMember })
  } catch (error) {
    console.error('Error updating member:', error)
    // Log error detail untuk debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: 'Failed to update member', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const auth = authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const id = parseInt(params.id)

    // Delete member
    await prisma.member.delete({
      where: { id_member: id }
    })

    return NextResponse.json({ 
      message: 'Member berhasil dihapus' 
    })
  } catch (error) {
    console.error('Error deleting member:', error)
    return NextResponse.json(
      { error: 'Failed to delete member' },
      { status: 500 }
    )
  }
}
