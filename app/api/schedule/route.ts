import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fieldId = searchParams.get('fieldId')

    if (!fieldId) {
      return NextResponse.json(
        { error: 'Field ID is required' },
        { status: 400 }
      )
    }

    // Get field data
    const field = await prisma.field.findFirst({
      where: {
        id_lapangan: parseInt(fieldId),
        isActive: true
      }
    })

    if (!field) {
      return NextResponse.json(
        { error: 'Field not found' },
        { status: 404 }
      )
    }

    // ✅ Generate schedule for the next 365 days (1 tahun) - untuk support member package 12 bulan
    const DAYS_AHEAD = 365
    const schedule = []
    const today = new Date()
    
    // Calculate date range
    const startDate = new Date(today)
    startDate.setHours(0, 0, 0, 0)
    
    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + DAYS_AHEAD)
    endDate.setHours(23, 59, 59, 999)
    
    // ✅ QUERY 1: Ambil SEMUA active members untuk field ini SEKALI SAJA
    // Hanya ambil member yang package-nya masih belum expired
    console.log('🚀 Fetching all active members...')
    const allActiveMembersRaw = await prisma.member.findMany({
      where: {
        id_lapangan: parseInt(fieldId),
        isActive: true
      }
    })
    
    // Filter members yang package-nya masih valid (belum expired)
    const allActiveMembers = allActiveMembersRaw.filter((m: any) => {
      const memberEndDate = new Date(m.tanggal_berakhir_member)
      return memberEndDate >= startDate
    })
    
    console.log(`✅ Found ${allActiveMembers.length} active members with valid package`)
    console.log('📋 Member details:', allActiveMembers.map((m: any) => ({ 
      id: m.id_member, 
      name: m.nama_member, 
      day: m.dayOfWeek, 
      time: `${m.jam_mulai_member}-${m.jam_selesai_member}`,
      packageValid: `${new Date(m.tanggal_mulai_member).toLocaleDateString()} - ${new Date(m.tanggal_berakhir_member).toLocaleDateString()}`
    })))
    
    // ✅ QUERY 2: Ambil SEMUA reservations untuk 90 hari ke depan SEKALI SAJA
    console.log('🚀 Fetching all reservations...')
    const allReservations = await prisma.reservation.findMany({
      where: {
        id_lapangan: parseInt(fieldId),
        tanggal_reservasi: {
          gte: startDate,
          lte: endDate
        },
        status_reservasi: {
          notIn: ['CANCELLED', 'REJECTED'] as any
        }
      },
      select: {
        id_reservasi: true,
        jam_mulai_reservasi: true,
        jam_selesai_reservasi: true,
        status_reservasi: true,
        status_pembayaran: true,
        tanggal_reservasi: true
      }
    })
    console.log(`✅ Found ${allReservations.length} reservations`)
    
    // ✅ Loop untuk generate schedule (tidak ada database query di dalam loop)
    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
    
    for (let i = 0; i < DAYS_AHEAD; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      // PENTING: Gunakan local date untuk semua operasi agar timezone konsisten
      const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      
      // Format date to YYYY-MM-DD dari localDate
      const year = localDate.getFullYear()
      const month = String(localDate.getMonth() + 1).padStart(2, '0')
      const day = String(localDate.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      
      // Get day of week
      const dayOfWeek = dayNames[localDate.getDay()]
      
      // ✅ Filter members by day of week AND package validity (di memory, sangat cepat)
      const activeMembers = allActiveMembers.filter((m: any) => {
        // Check day of week match
        if (m.dayOfWeek !== dayOfWeek) return false
        
        // Check if booking date is within member's package period
        const bookingDate = new Date(localDate)
        const memberStart = new Date(m.tanggal_mulai_member)
        const memberEnd = new Date(m.tanggal_berakhir_member)
        
        // Set all dates to midnight for comparison
        bookingDate.setHours(0, 0, 0, 0)
        memberStart.setHours(0, 0, 0, 0)
        memberEnd.setHours(23, 59, 59, 999)
        
        return bookingDate >= memberStart && bookingDate <= memberEnd
      })
      
      // Debug logging untuk tanggal tertentu
      if (dateStr === '2026-06-16' || dateStr === '2026-02-03' || dateStr === '2026-09-01') {
        console.log(`🔍 DEBUG for ${dateStr}:`)
        console.log('  dayOfWeek:', dayOfWeek)
        console.log('  All active members:', allActiveMembers.map((m: any) => ({ 
          name: m.nama_member, 
          day: m.dayOfWeek, 
          time: `${m.jam_mulai_member}-${m.jam_selesai_member}`,
          packageStart: new Date(m.tanggal_mulai_member).toLocaleDateString(),
          packageEnd: new Date(m.tanggal_berakhir_member).toLocaleDateString()
        })))
        console.log('  Filtered activeMembers for this date:', activeMembers.map((m: any) => ({ 
          name: m.nama_member, 
          day: m.dayOfWeek, 
          time: `${m.jam_mulai_member}-${m.jam_selesai_member}` 
        })))
        console.log('  Number of filtered members:', activeMembers.length)
      }
      
      // ✅ Filter reservations by date (di memory, sangat cepat)
      const reservations = allReservations.filter(r => {
        const resDate = new Date(r.tanggal_reservasi)
        const resDateStr = `${resDate.getFullYear()}-${String(resDate.getMonth() + 1).padStart(2, '0')}-${String(resDate.getDate()).padStart(2, '0')}`
        return resDateStr === dateStr
      })

      // Generate time slots (6 AM to 10 PM)
      const timeSlots = []
      for (let hour = 6; hour < 22; hour++) {
        const timeStr = `${hour.toString().padStart(2, '0')}:00`
        
        // Check if this time slot is booked by reservation
        const bookedReservation = reservations.find(reservation => {
          const startHour = parseInt(reservation.jam_mulai_reservasi.split(':')[0])
          const endHour = parseInt(reservation.jam_selesai_reservasi.split(':')[0])
          return hour >= startHour && hour < endHour
        })
        
        // Check if this time slot is blocked by member
        const blockedByMember = activeMembers.find((member: any) => {
          const startHour = parseInt(member.jam_mulai_member.split(':')[0])
          const endHour = parseInt(member.jam_selesai_member.split(':')[0])
          return hour >= startHour && hour < endHour
        })
        
        // Debug for specific date and time
        if (dateStr === '2026-06-16' && hour === 9) {
          console.log(`🔍 Checking hour ${hour}:00 on ${dateStr}`)
          console.log('  Active members for this day:', activeMembers.length)
          activeMembers.forEach((m: any) => {
            console.log(`    - ${m.nama_member}: ${m.jam_mulai_member} - ${m.jam_selesai_member}`)
            console.log(`      Start hour: ${parseInt(m.jam_mulai_member.split(':')[0])}, End hour: ${parseInt(m.jam_selesai_member.split(':')[0])}`)
            console.log(`      Should block? ${hour >= parseInt(m.jam_mulai_member.split(':')[0]) && hour < parseInt(m.jam_selesai_member.split(':')[0])}`)
          })
          console.log('  blockedByMember:', blockedByMember ? blockedByMember.nama_member : 'none')
        }

        timeSlots.push({
          time: timeStr,
          available: !bookedReservation && !blockedByMember,
          price: field.harga_per_jam,
          status: bookedReservation 
            ? 'booked' 
            : blockedByMember 
            ? 'member' 
            : 'available',
          reservationId: bookedReservation ? bookedReservation.id_reservasi : null,
          memberInfo: blockedByMember ? {
            name: blockedByMember.nama_member,
            contactName: blockedByMember.kontak_member
          } : null
        })
      }

      schedule.push({
        date: dateStr,
        timeSlots
      })
    }

    return NextResponse.json({
      success: true,
      schedule,
      field: {
        id: field.id_lapangan,
        name: field.nama_lapangan,
        price_per_hour: field.harga_per_jam,
        image_url: field.imageUrl,
        description: field.deskripsi
      }
    })

  } catch (error) {
    console.error('Error fetching schedule:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
