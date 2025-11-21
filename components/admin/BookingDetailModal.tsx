'use client'

import { X, Trash2 } from 'lucide-react'
import PaymentValidation from './PaymentValidation'
import Swal from 'sweetalert2'

interface BookingDetailModalProps {
  reservation: {
    id: number
    user_id: number
    field_name: string
    reservation_date: string
    start_time: string
    end_time: string
    total_price: number
    payment_type: 'FULL' | 'DP'
    payment_amount: number
  status: 'PENDING' | 'DP_SENT' | 'DP_PAID' | 'DP_REJECTED' | 'PELUNASAN_SENT' | 'PELUNASAN_PAID' | 'PELUNASAN_REJECTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'
  payment_status: 'PENDING' | 'FULL_SENT' | 'FULL_REJECTED' | 'DP_SENT' | 'DP_PAID' | 'DP_REJECTED' | 'PELUNASAN_SENT' | 'PELUNASAN_PAID' | 'PELUNASAN_REJECTED' | 'PAID' | 'REFUNDED'
    payment_proof?: string
    dp_proof?: string
    pelunasan_proof?: string
    payment_notes?: string
    dp_sender_account_name?: string
    pelunasan_sender_account_name?: string
    notes?: string
    created_at: string
    updated_at: string
    payment_validated_by?: number | null
    payment_validated_at?: string | null
    payment_validated_admin?: { id: number; name: string; email: string } | null
  dp_validated_by?: number | null
  dp_validated_at?: string | null
  dp_validated_admin?: { id: number; name: string; email: string } | null
  pelunasan_validated_by?: number | null
  pelunasan_validated_at?: string | null
  pelunasan_validated_admin?: { id: number; name: string; email: string } | null
    user: {
      id: number
      name: string
      email: string
      phone?: string
    }
    field: {
      id: number
      name: string
    }
  }
  isOpen: boolean
  onClose: () => void
  onPaymentStatusUpdate: (reservationId: number, status: string, notes?: string) => void
  onDelete?: () => void
}

export default function BookingDetailModal({ 
  reservation, 
  isOpen, 
  onClose, 
  onPaymentStatusUpdate,
  onDelete
}: BookingDetailModalProps) {
  // Removed payment proof preview state after eliminating proof section

  // Reset states when modal opens/closes
  const handleClose = () => {
    onClose()
  }

  // Handle delete reservation
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Hapus Reservasi?',
      html: `
        <div class="text-left">
          <p class="text-gray-700 mb-2">Apakah Anda yakin ingin menghapus reservasi ini?</p>
          <div class="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
            <p class="text-sm text-red-800"><strong>Perhatian:</strong> Data reservasi akan dihapus permanen dan tidak dapat dikembalikan.</p>
          </div>
          <div class="mt-3 text-sm text-gray-600">
            <p><strong>Customer:</strong> ${reservation.user.name}</p>
            <p><strong>Lapangan:</strong> ${reservation.field_name}</p>
            <p><strong>Tanggal:</strong> ${new Date(reservation.reservation_date).toLocaleDateString('id-ID')}</p>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      reverseButtons: true
    })

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: 'Token tidak ditemukan. Silakan login kembali.',
            confirmButtonColor: '#2563eb'
          })
          return
        }

        const response = await fetch(`/api/reservations/${reservation.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (response.ok) {
          await Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Reservasi berhasil dihapus',
            confirmButtonColor: '#2563eb',
            timer: 2000
          })
          
          onClose()
          if (onDelete) onDelete()
        } else {
          throw new Error(data.error || 'Gagal menghapus reservasi')
        }
      } catch (error: any) {
        console.error('Error deleting reservation:', error)
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: error.message || 'Terjadi kesalahan saat menghapus reservasi',
          confirmButtonColor: '#ef4444'
        })
      }
    }
  }

  // Removed payment proof handler

  if (!isOpen) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return timeString
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Menunggu' }
      case 'DP_SENT':
        return { color: 'bg-blue-100 text-blue-800', text: 'DP Terkirim' }
      case 'DP_PAID':
        return { color: 'bg-blue-200 text-blue-900', text: 'DP Terbayar' }
      case 'DP_REJECTED':
        return { color: 'bg-red-100 text-red-800', text: 'DP Ditolak' }
      case 'PELUNASAN_SENT':
        return { color: 'bg-purple-100 text-purple-800', text: 'Pelunasan Terkirim' }
        case 'PELUNASAN_REJECTED':
          return { color: 'bg-red-100 text-red-800', text: 'Pelunasan Ditolak' }
      case 'PELUNASAN_PAID':
        return { color: 'bg-purple-200 text-purple-900', text: 'Pelunasan Terbayar' }
      case 'REJECTED':
        return { color: 'bg-red-100 text-red-800', text: 'Ditolak Admin' }
      case 'CANCELLED':
        return { color: 'bg-orange-100 text-orange-800', text: 'Dibatalkan' }
      case 'COMPLETED':
        return { color: 'bg-green-100 text-green-800', text: 'Selesai' }
      default:
        return { color: 'bg-gray-100 text-gray-800', text: status }
    }
  }

  const getPaymentStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Menunggu' }
      case 'FULL_SENT':
        return { color: 'bg-blue-100 text-blue-800', text: 'Bukti Lunas Terkirim' }
      case 'FULL_REJECTED':
        return { color: 'bg-red-100 text-red-800', text: 'Ditolak Admin' }
      case 'DP_SENT':
        return { color: 'bg-blue-100 text-blue-800', text: 'DP Terkirim' }
      case 'DP_PAID':
        return { color: 'bg-blue-200 text-blue-900', text: 'DP Terbayar' }
      case 'DP_REJECTED':
        return { color: 'bg-red-100 text-red-800', text: 'DP Ditolak' }
      case 'PELUNASAN_SENT':
        return { color: 'bg-purple-100 text-purple-800', text: 'Pelunasan Terkirim' }
      case 'PELUNASAN_PAID':
        return { color: 'bg-purple-200 text-purple-900', text: 'Pelunasan Terbayar' }
      case 'PAID':
        return { color: 'bg-green-100 text-green-800', text: 'Lunas' }
      case 'REFUNDED':
        return { color: 'bg-red-100 text-red-800', text: 'Dikembalikan' }
      default:
        return { color: 'bg-gray-100 text-gray-800', text: status }
    }
  }

  const statusInfo = getStatusInfo(reservation.status)
  const paymentStatusInfo = getPaymentStatusInfo(reservation.payment_status)
  const formattedValidatedAt = reservation.payment_validated_at
    ? new Date(reservation.payment_validated_at).toLocaleString('id-ID')
    : null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-xl font-semibold text-gray-900">Detail Booking</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Booking Info */}
            <div className="space-y-6">
              {/* Field Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Informasi Lapangan</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Nama Lapangan:</span>
                    <span className="text-sm font-medium text-gray-900">{reservation.field_name}</span>
                  </div>

                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Informasi Customer</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Nama:</span>
                    <span className="text-sm font-medium text-gray-900">{reservation.user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium text-gray-900">{reservation.user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Telepon:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {reservation.user.phone || 'Tidak ada'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Detail Reservasi</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tanggal:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(reservation.reservation_date)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Waktu:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tipe Pembayaran:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {reservation.payment_type === 'DP' ? 'DP' : 'Lunas'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Harga:</span>
                    <span className="text-sm font-medium text-gray-900">
                      Rp {reservation.total_price.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pembayaran:</span>
                    <span className="text-sm font-medium text-gray-900">
                      Rp {(reservation.payment_amount || reservation.total_price).toLocaleString('id-ID')}
                    </span>
                  </div>
                  {reservation.payment_type === 'DP' && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Sisa Pembayaran:</span>
                      <span className="text-sm font-medium text-gray-900">
                        Rp {(reservation.total_price - (reservation.payment_amount || 0)).toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.text}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status Pembayaran:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentStatusInfo.color}`}>
                      {paymentStatusInfo.text}
                    </span>
                  </div>
                  {/* Validasi Admin baris dihapus sesuai permintaan (hanya tampil di komponen PaymentValidation) */}
                </div>
              </div>

              {/* Notes */}
              {reservation.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Catatan</h4>
                  <p className="text-sm text-gray-700">{reservation.notes}</p>
                </div>
              )}
            </div>

            {/* Right Column - Payment Validation */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Validasi Pembayaran</h4>
                <PaymentValidation
                  reservation={reservation}
                  onStatusUpdate={onPaymentStatusUpdate}
                />
              </div>

              {/* (Payment proof section removed as requested) */}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 flex-shrink-0 bg-gray-50">
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Hapus Reservasi
          </button>
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* (Payment proof modal removed) */}
    </div>
  )
}
