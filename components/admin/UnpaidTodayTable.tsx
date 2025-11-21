'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Calendar, Clock } from 'lucide-react'

// Helper function untuk mendapatkan tanggal lokal Indonesia (WIB UTC+7)
const getLocalDateString = (date: Date = new Date()): string => {
  const localDate = new Date(date.getTime() + (7 * 60 * 60 * 1000)) // UTC+7 untuk WIB
  return localDate.toISOString().split('T')[0]
}

interface Reservation {
  id: number
  user?: {
    name: string
    email?: string
    phone?: string
  }
  field_name?: string
  reservation_date: string
  start_time: string
  end_time: string
  total_price: number
  status: string
  payment_status?: string
}

interface UnpaidTodayTableProps {
  reservations: Reservation[]
}

export default function UnpaidTodayTable({ reservations }: UnpaidTodayTableProps) {
  const [unpaidReservations, setUnpaidReservations] = useState<Reservation[]>([])

  useEffect(() => {
    const todayStr = getLocalDateString()
    
    // Filter: hari ini dan belum PAID
    const filtered = reservations.filter(res => {
      const resDate = getLocalDateString(new Date(res.reservation_date))
      const isPaid = res.payment_status === 'PAID'
      const isCancelled = ['CANCELLED', 'REJECTED', 'DP_REJECTED'].includes(res.status)
      
      return resDate === todayStr && !isPaid && !isCancelled
    })

    // Sort by start time
    filtered.sort((a, b) => {
      const timeA = a.start_time.split(':').map(Number)
      const timeB = b.start_time.split(':').map(Number)
      return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1])
    })

    setUnpaidReservations(filtered)
  }, [reservations])

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: string } } = {
      'PENDING': { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' },
      'DP_SENT': { label: 'DP Terkirim', color: 'bg-blue-100 text-blue-800' },
      'DP_PAID': { label: 'DP Terbayar', color: 'bg-blue-200 text-blue-900' },
      'PELUNASAN_SENT': { label: 'Pelunasan Terkirim', color: 'bg-purple-100 text-purple-800' },
    }
    
    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
    
    return (
      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${String(date.getDate()).padStart(2, '0')}/${String(
      date.getMonth() + 1
    ).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)}`
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 relative overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Belum Lunas Hari Ini</h3>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {unpaidReservations.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada booking yang belum lunas hari ini</p>
            </div>
          ) : (
            <div className={`flex flex-col gap-4 ${unpaidReservations.length > 5 ? 'max-h-[600px] overflow-y-auto pr-2' : ''}`}>
              {unpaidReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-300"
                >
                  {/* User Info */}
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

                  {/* Date & Time */}
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

                  {/* Price */}
                  <div className="flex flex-col items-center min-w-[120px]">
                    <span className="text-xs text-gray-500">Total</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(reservation.total_price)}
                    </span>
                  </div>

                  {/* Payment Status */}
                  <div className="flex items-center justify-center min-w-[140px]">
                    {getStatusBadge(reservation.payment_status || reservation.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
