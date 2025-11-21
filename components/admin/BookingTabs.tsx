'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Calendar, Clock, Eye, Users, AlertCircle } from 'lucide-react'
import BookingDetailModal from '@/components/admin/BookingDetailModal'
import Swal from 'sweetalert2'

// Helper function untuk mendapatkan tanggal lokal Indonesia (WIB UTC+7)
const getLocalDateString = (date: Date = new Date()): string => {
  const localDate = new Date(date.getTime() + (7 * 60 * 60 * 1000)) // UTC+7 untuk WIB
  return localDate.toISOString().split('T')[0]
}

interface User {
  id: number
  name: string
  email: string
  phone?: string
}

interface Field {
  id: number
  name: string
}

interface Booking {
  id: number
  user_id: number
  field_name: string
  reservation_date: string
  start_time: string
  end_time: string
  total_price: number
  status: 'PENDING' | 'DP_SENT' | 'DP_PAID' | 'DP_REJECTED' | 'PELUNASAN_SENT' | 'PELUNASAN_PAID' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'
  payment_status: 'PENDING' | 'FULL_SENT' | 'FULL_REJECTED' | 'DP_SENT' | 'DP_PAID' | 'DP_REJECTED' | 'PELUNASAN_SENT' | 'PELUNASAN_PAID' | 'PAID' | 'REFUNDED' | 'PELUNASAN_REJECTED'
  payment_type: 'FULL' | 'DP'
  payment_amount: number
  payment_proof?: string
  payment_notes?: string
  notes?: string
  created_at: string
  updated_at: string
  payment_validated_by?: number | null
  payment_validated_at?: string | null
  payment_validated_admin?: { id: number; name: string; email: string } | null
  user: User
  field: Field
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

interface BookingTabsProps {
  fields: Array<{ id: number; name: string; isActive: boolean }>
  bookings: Booking[]
  reservations: Booking[]
}

type TabType = 'latest' | 'today' | 'unpaid'

export default function BookingTabs({ fields, bookings: initialBookings, reservations }: BookingTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('latest')
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [selectedField, setSelectedField] = useState<string>('')

  // Set default selected field to first active field
  useEffect(() => {
    const firstActiveField = fields.find(f => f.isActive)
    if (firstActiveField && !selectedField) {
      setSelectedField(firstActiveField.name)
    }
  }, [fields, selectedField])

  const sortedInitialBookings = [...initialBookings].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const lastSavedId =
    typeof window !== 'undefined' ? localStorage.getItem('lastBookingId') : null

  const lastBookingIdRef = useRef<number | null>(
    lastSavedId
      ? Number(lastSavedId)
      : sortedInitialBookings.length > 0
      ? sortedInitialBookings[0].id
      : null
  )

  const newCountRef = useRef<number>(0)
  const isPopupOpenRef = useRef<boolean>(false)
  const soundIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    notificationSoundRef.current = new Audio('/sounds/notification.wav')
    notificationSoundRef.current.loop = false
  }, [])

  const playNotificationSound = () => {
    if (notificationSoundRef.current) {
      notificationSoundRef.current.currentTime = 0
      notificationSoundRef.current
        .play()
        .catch((err) => console.warn('Gagal memutar suara:', err))
    }
  }

  const startRepeatingSound = () => {
    if (soundIntervalRef.current) return
    playNotificationSound()
    soundIntervalRef.current = setInterval(() => {
      playNotificationSound()
    }, 2500)
  }

  const stopRepeatingSound = () => {
    if (soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current)
      soundIntervalRef.current = null
    }
    if (notificationSoundRef.current) {
      notificationSoundRef.current.pause()
      notificationSoundRef.current.currentTime = 0
    }
  }

  const fetchBookings = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {}
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch('/api/admin/reservations', { cache: 'no-store', headers })
      if (!res.ok) throw new Error('Gagal mengambil data booking')

      const data = await res.json()
      const allBookings: Booking[] = (data.reservations || [])
        .sort(
          (a: Booking, b: Booking) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      
      const normalized = allBookings.map(r => ({
        ...r,
        payment_type: r.payment_type || 'FULL',
        payment_amount: typeof r.payment_amount === 'number' && !isNaN(r.payment_amount)
          ? r.payment_amount
          : r.total_price,
        payment_validated_by: r.payment_validated_by ?? null,
        payment_validated_at: r.payment_validated_at ?? null,
        payment_validated_admin: r.payment_validated_admin ?? null
      }))
      
      const list = normalized.slice(0, 5)

      if (lastBookingIdRef.current) {
        const lastIndex = list.findIndex(
          (b: Booking) => b.id === lastBookingIdRef.current
        )
        let newCount = 0

        if (lastIndex > 0) newCount = lastIndex
        else if (lastIndex === -1 && list.length > 0) newCount = list.length

        if (newCount > 0) {
          newCountRef.current += newCount
          startRepeatingSound()

          if (!isPopupOpenRef.current) {
            isPopupOpenRef.current = true
            Swal.fire({
              title: 'Pesanan Baru!',
              text: `Ada ${newCountRef.current} pesanan masuk.`,
              icon: 'info',
              confirmButtonColor: '#16a34a',
              confirmButtonText: 'OK',
              allowOutsideClick: false,
              willClose: () => {
                isPopupOpenRef.current = false
                newCountRef.current = 0
                stopRepeatingSound()
              },
            })
          } else {
            Swal.update({
              text: `Ada ${newCountRef.current} pesanan masuk.`,
            })
          }
        }
      }

      if (list.length > 0) {
        lastBookingIdRef.current = list[0].id
        localStorage.setItem('lastBookingId', list[0].id.toString())
      }

      setBookings(list)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }, [])

  useEffect(() => {
    fetchBookings()
    const interval = setInterval(fetchBookings, 5000)
    return () => {
      clearInterval(interval)
      stopRepeatingSound()
    }
  }, [fetchBookings])

  // Fetch members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const token = localStorage.getItem('token')
        const headers: HeadersInit = {}
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        const res = await fetch('/api/admin/members', { headers })
        if (res.ok) {
          const data = await res.json()
          setMembers(data.members || [])
        }
      } catch (err) {
        console.error('Gagal memuat data member:', err)
      }
    }

    fetchMembers()
    const interval = setInterval(fetchMembers, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      DP_SENT: 'bg-blue-100 text-blue-800',
      DP_PAID: 'bg-blue-200 text-blue-900',
      DP_REJECTED: 'bg-red-100 text-red-800',
      PELUNASAN_SENT: 'bg-purple-100 text-purple-800',
      PELUNASAN_PAID: 'bg-purple-200 text-purple-900',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-orange-100 text-orange-800',
      COMPLETED: 'bg-green-100 text-green-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPaymentStatusInfo = (paymentStatus: string, paymentType: string) => {
    switch (paymentStatus) {
      case 'PENDING':
        return { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' }
      case 'FULL_SENT':
        return { label: 'Bukti Lunas Terkirim', color: 'bg-blue-100 text-blue-800' }
      case 'FULL_REJECTED':
        return { label: 'Ditolak Admin', color: 'bg-red-100 text-red-800' }
      case 'DP_SENT':
        return { label: 'DP Terkirim', color: 'bg-blue-100 text-blue-800' }
      case 'DP_PAID':
        return { label: 'DP Terbayar', color: 'bg-blue-200 text-blue-900' }
      case 'DP_REJECTED':
        return { label: 'DP Ditolak', color: 'bg-red-100 text-red-800' }
      case 'PELUNASAN_SENT':
        return { label: 'Pelunasan Terkirim', color: 'bg-purple-100 text-purple-800' }
      case 'PELUNASAN_PAID':
        return { label: 'Pelunasan Terbayar', color: 'bg-purple-200 text-purple-900' }
      case 'PELUNASAN_REJECTED':
        return { label: 'Pelunasan Ditolak', color: 'bg-red-100 text-red-800' }
      case 'PAID':
        return { label: 'Lunas', color: 'bg-green-100 text-green-800' }
      case 'REFUNDED':
        return { label: 'Dikembalikan', color: 'bg-red-100 text-red-800' }
      default:
        return { label: paymentStatus, color: 'bg-gray-100 text-gray-800' }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${String(date.getDate()).padStart(2, '0')}/${String(
      date.getMonth() + 1
    ).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)}`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handleViewDetail = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedBooking(null)
  }

  const handlePaymentStatusUpdate = async (
    reservationId: number,
    status: string,
    notes?: string
  ) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/reservations/${reservationId}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentStatus: status, adminNotes: notes }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: errorData.error || 'Gagal memperbarui status pembayaran',
          confirmButtonColor: '#16a34a',
        })
        return
      }

      await fetchBookings()

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Status pembayaran berhasil diperbarui',
        confirmButtonColor: '#16a34a',
      })
    } catch (error) {
      console.error('Error updating payment status:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Terjadi kesalahan saat memperbarui status pembayaran',
        confirmButtonColor: '#16a34a',
      })
    }
  }

  // Filter for Today's Players
  const todayStr = getLocalDateString()
  const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()

  console.log('=== TODAY PLAYERS DEBUG ===')
  console.log('Today String:', todayStr)
  console.log('Day of Week:', dayOfWeek)
  console.log('Total Reservations:', reservations.length)
  console.log('Total Members:', members.length)

  const todayPlayers = reservations.filter(res => {
    const resDate = getLocalDateString(new Date(res.reservation_date))
    const isPaid = res.payment_status === 'PAID'
    const isCompleted = res.status === 'COMPLETED'
    const isToday = resDate === todayStr && (isPaid || isCompleted)
    
    if (isToday) {
      console.log('Today Player Found:', {
        name: res.user?.name,
        field_name: res.field_name,
        date: resDate,
        status: res.status,
        payment_status: res.payment_status
      })
    }
    
    return isToday
  })

  console.log('Filtered Today Players:', todayPlayers.length)

  const todayMembers = members.filter(m => m.dayOfWeek === dayOfWeek && m.isActive)
  
  console.log('Filtered Today Members:', todayMembers.length)
  console.log('Today Members Data:', todayMembers)
  todayMembers.forEach(m => {
    console.log('Member:', {
      name: m.name,
      fieldName: m.fieldName,
      contactName: m.contactName,
      startTime: m.startTime,
      endTime: m.endTime
    })
  })

  // Combine and sort by time
  const combinedTodayPlayers = [
    ...todayPlayers.map(r => ({
      type: 'booking' as const,
      name: r.user?.name || 'Tanpa Nama',
      contact: r.user?.phone || r.user?.email || '-',
      field: r.field_name,
      startTime: r.start_time,
      endTime: r.end_time,
      data: r
    })),
    ...todayMembers.map(m => ({
      type: 'member' as const,
      name: m.name,
      contact: m.contactName,
      field: (m as any).field?.name || m.fieldName || 'Lapangan Tidak Diketahui',
      startTime: m.startTime,
      endTime: m.endTime,
      data: m
    }))
  ].sort((a, b) => {
    const timeA = a.startTime.split(':').map(Number)
    const timeB = b.startTime.split(':').map(Number)
    const timeAInMinutes = timeA[0] * 60 + timeA[1]
    const timeBInMinutes = timeB[0] * 60 + timeB[1]
    
    // Get current time in minutes for sorting
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    
    // Get end time in minutes
    const endTimeA = a.endTime.split(':').map(Number)
    const endTimeB = b.endTime.split(':').map(Number)
    const endTimeAInMinutes = endTimeA[0] * 60 + endTimeA[1]
    const endTimeBInMinutes = endTimeB[0] * 60 + endTimeB[1]
    
    const aIsFinished = currentMinutes >= endTimeAInMinutes
    const bIsFinished = currentMinutes >= endTimeBInMinutes
    
    // Jika salah satu sudah selesai dan yang lain belum, yang selesai ke bawah
    if (aIsFinished && !bIsFinished) return 1
    if (!aIsFinished && bIsFinished) return -1
    
    // Jika keduanya sama-sama selesai atau belum selesai, urutkan berdasarkan waktu
    return timeAInMinutes - timeBInMinutes
  })

  // Debug: log combined players
  console.log('Combined Today Players:', combinedTodayPlayers)
  console.log('Combined Players Fields:', combinedTodayPlayers.map(p => p.field))

  // Get all active fields from database, not just fields with players
  const allActiveFields = fields
    .filter(f => f.isActive)
    .map(f => f.name)
    .sort()

  console.log('All Active Fields:', allActiveFields)

  // Filter players by selected field
  const filteredTodayPlayers = selectedField === 'all' 
    ? combinedTodayPlayers 
    : combinedTodayPlayers.filter(p => p.field === selectedField)

  // Helper function to get time in minutes
  const getTimeInMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  // Get current time in minutes
  const currentTime = new Date()
  const currentTimeInMinutes = currentTime.getHours() * 60 + currentTime.getMinutes()

  // Helper function to get card background class
  const getCardBackgroundClass = (player: typeof combinedTodayPlayers[0]) => {
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

  // Filter for Unpaid Today
  const unpaidToday = reservations.filter(res => {
    const resDate = getLocalDateString(new Date(res.reservation_date))
    const isPaid = res.payment_status === 'PAID'
    const isCancelled = ['CANCELLED', 'REJECTED', 'DP_REJECTED'].includes(res.status)
    return resDate === todayStr && !isPaid && !isCancelled
  }).sort((a, b) => {
    const timeA = a.start_time.split(':').map(Number)
    const timeB = b.start_time.split(':').map(Number)
    return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1])
  })

  const tabs = [
    { id: 'latest' as TabType, label: 'Booking Terbaru', icon: Calendar, count: bookings.length },
    { id: 'today' as TabType, label: 'Pemain Hari Ini', icon: Users, count: combinedTodayPlayers.length },
    { id: 'unpaid' as TabType, label: 'Belum Lunas', icon: AlertCircle, count: unpaidToday.length },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 relative overflow-hidden">
        {/* Tabs Header - Folder Style */}
        <div className="p-4 sm:p-6 pb-0">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap rounded-t-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-md border-t border-x border-gray-200 -mb-px z-10'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 border-t border-gray-200">
          {/* Latest Bookings */}
          {activeTab === 'latest' && (
            <>
              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada booking</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-300"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{booking.user.name}</p>
                        <p className="text-sm text-gray-600 truncate">{booking.field_name}</p>
                      </div>

                      <div className="flex flex-col items-center text-sm text-gray-700 min-w-[140px]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>{formatDate(booking.reservation_date)}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>{booking.start_time} – {booking.end_time}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center min-w-[100px]">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium ${
                            getPaymentStatusInfo(
                              booking.payment_status || 'PENDING',
                              booking.payment_type || 'FULL'
                            ).color
                          }`}
                        >
                          {getPaymentStatusInfo(
                            booking.payment_status || 'PENDING',
                            booking.payment_type || 'FULL'
                          ).label}
                        </span>
                      </div>

                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleViewDetail(booking)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Today's Players */}
          {activeTab === 'today' && (
            <>
              {/* Field Filter Navbar */}
              {allActiveFields.length > 0 && (
                <div className="mb-4 border-b border-gray-200">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {allActiveFields.map((fieldName) => {
                      const count = combinedTodayPlayers.filter(p => p.field === fieldName).length
                      return (
                        <button
                          key={fieldName}
                          onClick={() => setSelectedField(fieldName)}
                          className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg transition-all ${
                            selectedField === fieldName
                              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          {fieldName}
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-700">
                            {count}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {filteredTodayPlayers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {selectedField === 'all' 
                      ? 'Belum ada pemain hari ini' 
                      : `Belum ada pemain di ${selectedField} hari ini`}
                  </p>
                </div>
              ) : (
                <div className={`flex flex-col gap-4 ${filteredTodayPlayers.length > 5 ? 'max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent' : ''}`}>
                  {filteredTodayPlayers.map((player, index) => (
                    <div
                      key={`${player.type}-${index}`}
                      className={`${getCardBackgroundClass(player)} border rounded-xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-300`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 truncate">{player.name}</p>
                          {player.type === 'member' && (
                            <span className="px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full">
                              Member
                            </span>
                          )}
                          {player.type === 'booking' && (
                            <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                              User
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{player.contact}</p>
                      </div>

                      <div className="flex flex-col items-center text-sm text-gray-700 min-w-[140px]">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>{player.startTime} – {player.endTime}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Unpaid Today */}
          {activeTab === 'unpaid' && (
            <>
              {unpaidToday.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Tidak ada booking yang belum lunas hari ini</p>
                </div>
              ) : (
                <div className={`flex flex-col gap-4 ${unpaidToday.length > 5 ? 'max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent' : ''}`}>
                  {unpaidToday.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-300"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {reservation.user?.name || 'Tanpa Nama'}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {reservation.field_name || 'Tidak Diketahui'}
                        </p>
                        {reservation.user?.phone && (
                          <p className="text-xs text-gray-500 mt-1">{reservation.user.phone}</p>
                        )}
                      </div>

                      <div className="flex flex-col items-center text-sm text-gray-700 min-w-[140px]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>{formatDate(reservation.reservation_date)}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>{reservation.start_time} – {reservation.end_time}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center min-w-[120px]">
                        <span className="text-xs text-gray-500">Total</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(reservation.total_price)}
                        </span>
                      </div>

                      <div className="flex items-center justify-center min-w-[140px]">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium ${
                            getPaymentStatusInfo(
                              reservation.payment_status || 'PENDING',
                              reservation.payment_type || 'FULL'
                            ).color
                          }`}
                        >
                          {getPaymentStatusInfo(
                            reservation.payment_status || 'PENDING',
                            reservation.payment_type || 'FULL'
                          ).label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedBooking && (
        <BookingDetailModal
          reservation={selectedBooking}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onPaymentStatusUpdate={handlePaymentStatusUpdate}
        />
      )}
    </div>
  )
}
