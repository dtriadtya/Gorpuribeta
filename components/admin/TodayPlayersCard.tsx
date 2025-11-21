'use client'

import { Clock, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

// Helper function untuk mendapatkan tanggal lokal Indonesia (WIB UTC+7)
const getLocalDateString = (date: Date = new Date()): string => {
  const localDate = new Date(date.getTime() + (7 * 60 * 60 * 1000)) // UTC+7 untuk WIB
  return localDate.toISOString().split('T')[0]
}

interface Reservation {
  id: number
  user_id: number
  field_id: number
  field_name: string
  location: string
  reservation_date: string
  start_time: string
  end_time: string
  total_price: number
  status: 'PENDING' | 'DP_SENT' | 'DP_PAID' | 'DP_REJECTED' | 'PELUNASAN_SENT' | 'PELUNASAN_PAID' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'
  payment_status: 'PENDING' | 'DP_SENT' | 'DP_PAID' | 'DP_REJECTED' | 'PELUNASAN_SENT' | 'PELUNASAN_PAID' | 'PAID' | 'REFUNDED'
  user?: {
    id: number
    name: string
    email: string
    phone?: string
  }
}

interface Member {
  id: number
  name: string
  contactName: string
  fieldId: number
  fieldName: string
  dayOfWeek: string
  startTime: string
  endTime: string
  isActive: boolean
}

interface TodayPlayersCardProps {
  reservations: Reservation[]
}

export default function TodayPlayersCard({ reservations }: TodayPlayersCardProps) {
  const [members, setMembers] = useState<Member[]>([])
  
  // Debug: log semua reservations yang diterima
  console.log('=== TodayPlayersCard Debug ===')
  console.log('Total reservations received:', reservations.length)
  console.log('Reservations data:', reservations)
  
  // Fetch members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const token = localStorage.getItem('token')
        const headers: HeadersInit = {}
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        const response = await fetch('/api/admin/members', { headers })
        if (response.ok) {
          const data = await response.json()
          setMembers(data.members || [])
        }
      } catch (error) {
        console.error('Error fetching members:', error)
      }
    }
    fetchMembers()
  }, [])

  // Filter hanya reservasi hari ini yang statusnya bukan CANCELLED atau REJECTED
  // Gunakan waktu lokal Indonesia (WIB/WITA/WIT)
  const now = new Date()
  const localDate = new Date(now.getTime() + (7 * 60 * 60 * 1000)) // UTC+7 untuk WIB
  const today = getLocalDateString()
  const dayOfWeek = localDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
  
  console.log('Today date (local):', today)
  console.log('Day of week:', dayOfWeek)
  
  // Tentukan waktu saat ini
  const currentTime = new Date()
  const currentHour = currentTime.getHours()
  const currentMinute = currentTime.getMinutes()
  const currentTimeInMinutes = currentHour * 60 + currentMinute

  const getTimeInMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  // Filter member yang main hari ini
  const todayMembers = members.filter(m => m.dayOfWeek === dayOfWeek && m.isActive)

  const todayReservations = reservations
    .filter(res => {
      const resDate = getLocalDateString(new Date(res.reservation_date))
      const isToday = resDate === today
      const isPaid = res.payment_status === 'PAID'
      const isCompleted = res.status === 'COMPLETED'
      
      // Debug: log SEMUA reservasi yang diterima
      console.log('Checking reservation:', {
        id: res.id,
        user: res.user?.name,
        date: resDate,
        today: today,
        isToday,
        status: res.status,
        payment_status: res.payment_status,
        isPaid,
        isCompleted,
        willShow: isToday && (isPaid || isCompleted)
      })
      
      // Tampilkan jika hari ini DAN (payment_status PAID ATAU status COMPLETED)
      return isToday && (isPaid || isCompleted)
    })
  
  console.log('Filtered today reservations:', todayReservations.length)
  console.log('Today reservations data:', todayReservations)

  // Gabungkan reservasi dan member menjadi satu array dengan tipe yang sama
  const allPlayers = [
    ...todayReservations.map(res => ({
      type: 'reservation' as const,
      id: `res-${res.id}`,
      name: res.user?.name || 'Unknown',
      fieldName: res.field_name,
      startTime: res.start_time,
      endTime: res.end_time,
      contact: res.user?.phone || '-',
      paymentStatus: res.payment_status,
      reservation: res
    })),
    ...todayMembers.map(mem => ({
      type: 'member' as const,
      id: `mem-${mem.id}`,
      name: mem.name,
      fieldName: mem.fieldName,
      startTime: mem.startTime,
      endTime: mem.endTime,
      contact: mem.contactName,
      paymentStatus: null,
      member: mem
    }))
  ]
    .sort((a, b) => {
      // Tentukan status untuk a dan b
      const aStartTime = getTimeInMinutes(a.startTime)
      const aEndTime = getTimeInMinutes(a.endTime)
      const bStartTime = getTimeInMinutes(b.startTime)
      const bEndTime = getTimeInMinutes(b.endTime)

      const aIsFinished = currentTimeInMinutes >= aEndTime
      const bIsFinished = currentTimeInMinutes >= bEndTime

      // Jika salah satu sudah selesai dan yang lain belum, yang selesai ke bawah
      if (aIsFinished && !bIsFinished) return 1
      if (!aIsFinished && bIsFinished) return -1

      // Jika keduanya sama-sama selesai atau belum selesai, urutkan berdasarkan waktu
      return aStartTime - bStartTime
    })
    .slice(0, 5) // Ambil hanya 5 teratas

  const getStatusBadge = (player: typeof allPlayers[0]) => {
    if (player.type === 'member') {
      return <span className="px-2 py-1 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full">
        Member
      </span>
    }

    const startTimeInMinutes = getTimeInMinutes(player.startTime)
    const endTimeInMinutes = getTimeInMinutes(player.endTime)

    if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes) {
      return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Sedang Main</span>
    } else if (currentTimeInMinutes < startTimeInMinutes) {
      return <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">Akan Main</span>
    } else {
      return <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">Selesai</span>
    }
  }

  const formatTime = (time: string) => {
    return time.substring(0, 5) // HH:MM
  }

  // Helper function to get card background color based on time
  const getCardBackgroundClass = (player: typeof allPlayers[0]) => {
    const startTimeInMinutes = getTimeInMinutes(player.startTime)
    const endTimeInMinutes = getTimeInMinutes(player.endTime)

    // Jika sudah selesai (waktu sekarang >= end time)
    if (currentTimeInMinutes >= endTimeInMinutes) {
      return 'bg-gray-100 border-gray-300 opacity-75'
    }
    // Jika sedang main (waktu sekarang >= start time dan < end time)
    if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes) {
      return 'bg-green-50 border-green-200'
    }
    // Default background (belum main)
    return 'bg-white border-gray-200'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 relative overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Pemain Hari Ini</h3>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {allPlayers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Tidak ada pemain hari ini</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {allPlayers.map((player) => (
              <div
                key={player.id}
                className={`${getCardBackgroundClass(player)} border rounded-xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-300`}
              >
                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 truncate">{player.name}</p>
                    {player.type === 'member' && (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full">
                        Member
                      </span>
                    )}
                    {player.type === 'reservation' && (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                        User
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{player.contact}</p>
                </div>

                {/* Time */}
                <div className="flex items-center gap-1 text-sm text-gray-700 min-w-[140px]">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{formatTime(player.startTime)} – {formatTime(player.endTime)}</span>
                </div>

                {/* Status Badge */}
                <div className="flex flex-col items-center justify-center min-w-[100px] gap-2">
                  {player.type === 'reservation' && player.paymentStatus && (
                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium ${
                      player.paymentStatus === 'PAID'
                        ? 'bg-green-100 text-green-800'
                        : player.paymentStatus === 'DP_PAID'
                        ? 'bg-blue-200 text-blue-900'
                        : player.paymentStatus === 'DP_SENT'
                        ? 'bg-blue-100 text-blue-800'
                        : player.paymentStatus === 'PELUNASAN_SENT'
                        ? 'bg-purple-100 text-purple-800'
                        : player.paymentStatus === 'PELUNASAN_PAID'
                        ? 'bg-purple-200 text-purple-900'
                        : player.paymentStatus === 'DP_REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : player.paymentStatus === 'REFUNDED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {player.paymentStatus === 'PAID'
                        ? 'Lunas'
                        : player.paymentStatus === 'DP_PAID'
                        ? 'DP Terbayar'
                        : player.paymentStatus === 'DP_SENT'
                        ? 'DP Terkirim'
                        : player.paymentStatus === 'PELUNASAN_SENT'
                        ? 'Pelunasan Terkirim'
                        : player.paymentStatus === 'PELUNASAN_PAID'
                        ? 'Pelunasan Terbayar'
                        : player.paymentStatus === 'DP_REJECTED'
                        ? 'DP Ditolak'
                        : player.paymentStatus === 'REFUNDED'
                        ? 'Dikembalikan'
                        : 'Pending'}
                    </span>
                  )}
                  {player.type === 'member' && (
                    <span className="px-2 py-1 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full">
                      Member
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
