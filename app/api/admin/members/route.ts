import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

// GET all members
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

    const members = await prisma.member.findMany({
      include: {
        lapangan: {
          select: {
            id_lapangan: true,
            nama_lapangan: true
          }
        }
      },
      orderBy: {
        member_dibuat_pada: 'desc'
      }
    })

    // Map to frontend-friendly format
    const mappedMembers = members.map((member: any) => ({
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
        name: member.lapangan.nama_lapangan
      }
    }))

    return NextResponse.json({ members: mappedMembers })
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}

// POST create new member
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
    const {
      name,
      contactName,
      fieldId,
      schedules, // Array of {dayOfWeek, startTime, endTime}
      dayOfWeek, // Legacy support
      startTime, // Legacy support
      endTime, // Legacy support
      packageType = 'MONTHLY_1',
      startDate
    } = body

    // Log untuk debugging
    console.log('Received data:', { name, contactName, fieldId, schedules, dayOfWeek, startTime, endTime, packageType, startDate })

    if (!name || !contactName || !fieldId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, contactName, fieldId' },
        { status: 400 }
      )
    }

    // Support both new schedules array format and legacy single schedule
    const schedulesToCreate = schedules && Array.isArray(schedules) 
      ? schedules 
      : (dayOfWeek && startTime && endTime ? [{ dayOfWeek, startTime, endTime }] : [])

    if (schedulesToCreate.length === 0) {
      return NextResponse.json(
        { error: 'At least one schedule is required' },
        { status: 400 }
      )
    }

    // Convert fieldId to number jika masih string
    const fieldIdNumber = typeof fieldId === 'string' ? parseInt(fieldId) : fieldId

    // Validasi fieldId adalah number yang valid
    if (isNaN(fieldIdNumber)) {
      return NextResponse.json(
        { error: 'Invalid field ID' },
        { status: 400 }
      )
    }

    // Validasi dayOfWeek adalah nilai enum yang valid untuk semua schedules
    const validDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
    for (const schedule of schedulesToCreate) {
      if (!validDays.includes(schedule.dayOfWeek)) {
        return NextResponse.json(
          { error: `Invalid day of week: ${schedule.dayOfWeek}` },
          { status: 400 }
        )
      }
      if (!schedule.startTime || !schedule.endTime) {
        return NextResponse.json(
          { error: 'Each schedule must have startTime and endTime' },
          { status: 400 }
        )
      }
    }

    // Check for schedule conflicts with existing members
    const existingMembers = await prisma.member.findMany({
      where: {
        id_lapangan: fieldIdNumber,
        isActive: true
      },
      select: {
        id_member: true,
        nama_member: true,
        dayOfWeek: true,
        jam_mulai_member: true,
        jam_selesai_member: true
      }
    })

    // Helper function to check if two time ranges overlap
    const timeRangesOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
      const s1 = start1.replace(':', '')
      const e1 = end1.replace(':', '')
      const s2 = start2.replace(':', '')
      const e2 = end2.replace(':', '')
      
      // Check if ranges overlap: (start1 < end2) AND (end1 > start2)
      return (s1 < e2) && (e1 > s2)
    }

    // Check each new schedule against existing schedules
    const conflicts = []
    for (const newSchedule of schedulesToCreate) {
      for (const existingMember of existingMembers) {
        if (existingMember.dayOfWeek === newSchedule.dayOfWeek) {
          if (timeRangesOverlap(
            newSchedule.startTime,
            newSchedule.endTime,
            existingMember.jam_mulai_member,
            existingMember.jam_selesai_member
          )) {
            conflicts.push({
              day: newSchedule.dayOfWeek,
              time: `${newSchedule.startTime}-${newSchedule.endTime}`,
              conflictWith: existingMember.nama_member,
              conflictTime: `${existingMember.jam_mulai_member}-${existingMember.jam_selesai_member}`
            })
          }
        }
      }
    }

    // If conflicts found, return error with details
    if (conflicts.length > 0) {
      // Map day names to Indonesian
      const dayMap: Record<string, string> = {
        'MONDAY': 'Senin',
        'TUESDAY': 'Selasa',
        'WEDNESDAY': 'Rabu',
        'THURSDAY': 'Kamis',
        'FRIDAY': 'Jumat',
        'SATURDAY': 'Sabtu',
        'SUNDAY': 'Minggu'
      }
      
      const conflictMessages = conflicts.map(c => 
        `${dayMap[c.day] || c.day} ${c.time} bentrok dengan ${c.conflictWith} (${c.conflictTime})`
      ).join(', ')
      
      return NextResponse.json(
        { 
          error: 'Jadwal bentrok dengan member lain', 
          conflicts: conflicts,
          message: conflictMessages
        },
        { status: 409 }
      )
    }

    // Calculate end date based on package type
    const memberStartDate = startDate ? new Date(startDate) : new Date()
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
      default:
        memberEndDate.setMonth(memberEndDate.getMonth() + 1)
    }

    // Create multiple member entries for each schedule
    const createdMembers = []
    for (const schedule of schedulesToCreate) {
      const member = await prisma.member.create({
        data: {
          nama_member: name,
          kontak_member: contactName,
          id_lapangan: fieldIdNumber,
          dayOfWeek: schedule.dayOfWeek,
          jam_mulai_member: schedule.startTime,
          jam_selesai_member: schedule.endTime,
          jenis_paket_member: packageType as any,
          tanggal_mulai_member: memberStartDate,
          tanggal_berakhir_member: memberEndDate
        } as any,
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
      createdMembers.push(member)
    }

    console.log('Members created successfully:', createdMembers.length, 'schedules')

    // Map response to old field names for backward compatibility
    const mappedMembers = createdMembers.map(member => ({
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
    }))

    return NextResponse.json({ 
      members: mappedMembers,
      message: `Member berhasil ditambahkan dengan ${createdMembers.length} jadwal. Slot waktu akan otomatis diblokir untuk user.`
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating member:', error)
    // Log error detail untuk debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: 'Failed to create member', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

