'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Calendar, Clock, Eye } from 'lucide-react'
import BookingDetailModal from '@/components/admin/BookingDetailModal'
import Swal from 'sweetalert2'

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
  payment_status: 'PENDING' | 'DP_SENT' | 'DP_PAID' | 'DP_REJECTED' | 'PELUNASAN_SENT' | 'PELUNASAN_PAID' | 'PAID' | 'REFUNDED'
  | 'PELUNASAN_REJECTED'
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

interface LatestBookingsProps {
  bookings: Booking[]
}

export default function LatestBookings({ bookings: initialBookings }: LatestBookingsProps) {
  const sortedInitialBookings = [...initialBookings].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const [bookings, setBookings] = useState<Booking[]>(sortedInitialBookings)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // ✅ Ambil lastBookingId dari localStorage agar tidak reset tiap refresh
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

  // 🔊 Load audio notifikasi
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
      
      // Normalize payment fields to satisfy required interface
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

      // ✅ Simpan ID terakhir di ref + localStorage agar tidak trigger ulang setelah refresh
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

  const formatStatusLabel = (status: string) => {
    const formatted = status.charAt(0) + status.slice(1).toLowerCase()
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${String(date.getDate()).padStart(2, '0')}/${String(
      date.getMonth() + 1
    ).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)}`
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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 relative overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Booking Terbaru</h3>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada booking</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-300"
                >
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{booking.user.name}</p>
                    <p className="text-sm text-gray-600 truncate">{booking.field_name}</p>
                  </div>

                  {/* Date & Time */}
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

                  {/* Payment Status */}
                  <div className="flex items-center justify-center min-w-[100px]">
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium ${
                        getPaymentStatusInfo(
                          booking.payment_status || 'PENDING',
                          booking.payment_type || 'FULL'
                        ).color
                      }`}
                    >
                      {
                        getPaymentStatusInfo(
                          booking.payment_status || 'PENDING',
                          booking.payment_type || 'FULL'
                        ).label
                      }
                    </span>
                  </div>

                  {/* Action Button */}
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
