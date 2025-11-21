'use client'

import { useState, useEffect } from 'react'
import { X, Eye } from 'lucide-react'
import Swal from 'sweetalert2'

interface PaymentValidationProps {
  reservation: {
    id: number
    payment_status: 'PENDING' | 'FULL_SENT' | 'FULL_REJECTED' | 'DP_SENT' | 'DP_PAID' | 'DP_REJECTED' | 'PELUNASAN_SENT' | 'PELUNASAN_PAID' | 'PELUNASAN_REJECTED' | 'PAID' | 'REFUNDED'
    status?: string
    payment_type: 'FULL' | 'DP'
    payment_amount?: number | null
    payment_proof?: string
    dp_proof?: string
    pelunasan_proof?: string
    payment_notes?: string
    dp_sender_account_name?: string
    pelunasan_sender_account_name?: string
    total_price?: number | null
    payment_validated_by?: number | null
    payment_validated_at?: string | null
    payment_validated_admin?: { id: number; name: string; email: string } | null
    dp_validated_by?: number | null
    dp_validated_at?: string | null
    dp_validated_admin?: { id: number; name: string; email: string } | null
    pelunasan_validated_by?: number | null
    pelunasan_validated_at?: string | null
    pelunasan_validated_admin?: { id: number; name: string; email: string } | null
  }
  onStatusUpdate: (reservationId: number, status: string, notes?: string) => void
}

export default function PaymentValidation({ reservation, onStatusUpdate }: PaymentValidationProps) {
  const noteText = reservation.payment_notes?.toLowerCase() || ''
  
  // Check if reservation is cancelled or rejected
  const isCancelledOrRejected = reservation.status === 'CANCELLED' || reservation.status === 'REJECTED'
  
  // For FULL payment type: use payment_proof OR dp_proof (fallback for rejected bookings)
  // Sometimes FULL payment proof is stored in dp_proof field
  const fullProofUrl = reservation.payment_type === 'FULL' 
    ? (reservation.payment_proof || reservation.dp_proof || undefined) 
    : undefined
  
  // For DP payment type: DP proof from dp_proof field, or payment_proof if no pelunasan yet
  // Also check dp_proof even for rejected/cancelled status
  const dpProofUrl = reservation.payment_type === 'DP' ? (
    reservation.dp_proof || 
    reservation.payment_proof || 
    undefined
  ) : undefined

  // Pelunasan proof from pelunasan_proof field, or payment_proof when pelunasan status is active
  // Check pelunasan_proof for DP payment regardless of status
  const pelunasanProofUrl = reservation.payment_type === 'DP' ? (
    reservation.pelunasan_proof || undefined
  ) : undefined
  
  const dpProofAvailable = Boolean(dpProofUrl)
  const pelunasanProofAvailable = Boolean(pelunasanProofUrl)
  const fullProofAvailable = Boolean(fullProofUrl)
  
  // Debug logs
  console.log('Proof URLs:', { 
    payment_type: reservation.payment_type,
    raw_payment_proof: reservation.payment_proof,
    raw_dp_proof: reservation.dp_proof,
    raw_pelunasan_proof: reservation.pelunasan_proof,
    computed_dpProofUrl: dpProofUrl,
    computed_pelunasanProofUrl: pelunasanProofUrl,
    computed_fullProofUrl: fullProofUrl,
    dpProofAvailable,
    pelunasanProofAvailable,
    fullProofAvailable
  })

  const [isUpdating, setIsUpdating] = useState(false)
  const [isRejectingPelunasan, setIsRejectingPelunasan] = useState(false)
  const [isRejectingDp, setIsRejectingDp] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [currentProofType, setCurrentProofType] = useState<'dp' | 'pelunasan' | 'full'>(
    reservation.payment_type === 'DP' ? 'dp' : 'full'
  )
  const [dpProofViewed, setDpProofViewed] = useState(!dpProofAvailable)
  const [pelunasanProofViewed, setPelunasanProofViewed] = useState(!pelunasanProofAvailable)
  const [fullProofViewed, setFullProofViewed] = useState(!fullProofAvailable)
  const activeProofUrl = currentProofType === 'pelunasan'
    ? pelunasanProofUrl
    : currentProofType === 'dp'
    ? dpProofUrl
    : fullProofUrl

  // Reset viewed states when reservation changes
  useEffect(() => {
    setDpProofViewed(!Boolean(dpProofUrl))
    setPelunasanProofViewed(!Boolean(pelunasanProofUrl))
    setFullProofViewed(!Boolean(fullProofUrl))
  }, [reservation.id, dpProofUrl, pelunasanProofUrl, fullProofUrl])

  // Button style utilities for consistent sizing and alignment
  // Buttons: fixed height for visual consistency, responsive grid for actions
  const baseBtn = 'flex items-center justify-center px-4 h-10 rounded-lg text-sm font-medium transition-colors'
  const primary = `${baseBtn} bg-blue-600 text-white hover:bg-blue-700 w-full`
  const danger = `${baseBtn} bg-red-600 text-white hover:bg-red-700 w-full`
  const success = `${baseBtn} bg-green-600 text-white hover:bg-green-700 w-full`
  const neutral = `${baseBtn} bg-gray-600 text-white hover:bg-gray-700 w-full`
  const centeredNeutral = `${baseBtn} bg-gray-600 text-white hover:bg-gray-700 w-1/2`
  // Proof buttons: full width and same height as action buttons for tidy alignment
  const smallPrimary = 'flex items-center justify-center space-x-2 px-3 h-10 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 w-full'
  const smallSecondary = 'flex items-center justify-center space-x-2 px-3 h-10 rounded-md text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 w-full'
  const smallDisabled = 'flex items-center justify-center space-x-2 px-3 h-10 rounded-md text-sm font-medium bg-gray-200 text-gray-500 cursor-not-allowed w-full'

  const handleViewProof = (type: 'dp' | 'pelunasan' | 'full') => {
    // Allow viewing proof regardless of reservation status
    if (type === 'dp' && !dpProofUrl) return
    if (type === 'pelunasan' && !pelunasanProofUrl) return
    if (type === 'full' && !fullProofUrl) return

    setCurrentProofType(type)
    setShowModal(true)

    // Mark proof as viewed (for validation workflow)
    if (type === 'dp') {
      setDpProofViewed(true)
    } else if (type === 'pelunasan') {
      setPelunasanProofViewed(true)
    } else {
      setFullProofViewed(true)
    }
  }

  const isDpReservation = reservation.payment_type === 'DP'
  // Pelunasan can be verified when a pelunasan proof is available
  // Allow verification when proof exists, regardless of current status (except already PAID)
  const canVerifyPelunasan = Boolean(
    pelunasanProofUrl && reservation.payment_status !== 'PAID'
  )
  const dpProofRequirementMet = !dpProofAvailable || dpProofViewed
  const pelunasanProofRequirementMet = !pelunasanProofAvailable || pelunasanProofViewed
  const fullProofRequirementMet = !fullProofAvailable || fullProofViewed
  const shouldShowProofWarning = Boolean(
    (!dpProofRequirementMet && isDpReservation) ||
    (!pelunasanProofRequirementMet && isDpReservation && pelunasanProofAvailable) ||
    (!isDpReservation && !fullProofRequirementMet)
  )

  const handleRejectPelunasan = async () => {
    if (isRejectingPelunasan) return
    
    // Check if proof is available based on payment type
    const hasProof = reservation.payment_type === 'DP' ? pelunasanProofAvailable : fullProofAvailable
    const proofViewed = reservation.payment_type === 'DP' ? pelunasanProofViewed : fullProofViewed
    
    if (!hasProof) return
    
    if (!proofViewed) {
      await Swal.fire({
        icon: 'info',
        title: 'Lihat bukti terlebih dahulu',
        text: `Silakan lihat bukti ${reservation.payment_type === 'DP' ? 'pelunasan' : 'pembayaran'} sebelum menolak.`,
        confirmButtonText: 'OK'
      })
      return
    }

    // Pesan konfirmasi berbeda untuk FULL vs DP
    const confirmMessage = reservation.payment_type === 'FULL'
      ? 'Booking akan DITOLAK dan user harus melakukan reservasi ulang dari awal.'
      : 'User harus mengunggah ulang bukti pelunasan setelah penolakan.'

    const confirmResult = await Swal.fire({
      title: `Tolak bukti ${reservation.payment_type === 'DP' ? 'pelunasan' : 'pembayaran'}?`,
      text: confirmMessage,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, tolak',
      cancelButtonText: 'Batal'
    })

    if (!confirmResult.isConfirmed) {
      return
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      await Swal.fire({
        icon: 'error',
        title: 'Sesi berakhir',
        text: 'Silakan login ulang sebagai admin untuk melanjutkan.',
        confirmButtonText: 'OK'
      })
      return
    }

    try {
      setIsRejectingPelunasan(true)
      
      // Untuk FULL payment, gunakan action REJECT_FULL agar booking ditolak sepenuhnya
      const action = reservation.payment_type === 'FULL' ? 'REJECT_FULL' : 'REJECT_PELUNASAN'
      
      const response = await fetch(`/api/reservations/${reservation.id}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action, adminNotes: 'Ditolak oleh admin' })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData?.error || `Gagal menolak bukti ${reservation.payment_type === 'DP' ? 'pelunasan' : 'pembayaran'}`)
      }

      // Pesan sukses berbeda untuk FULL vs DP
      const successMessage = reservation.payment_type === 'FULL'
        ? 'Booking telah ditolak. User harus melakukan reservasi ulang.'
        : 'User dapat mengunggah ulang bukti pelunasan yang valid.'

      await Swal.fire({
        icon: 'success',
        title: `Bukti ${reservation.payment_type === 'DP' ? 'pelunasan' : 'pembayaran'} ditolak`,
        text: successMessage,
        confirmButtonText: 'OK'
      })

      onStatusUpdate(reservation.id, action)
    } catch (error) {
      console.error('Error rejecting payment proof:', error)
      await Swal.fire({
        icon: 'error',
        title: 'Gagal menolak bukti',
        text: error instanceof Error ? error.message : `Terjadi kesalahan saat menolak bukti ${reservation.payment_type === 'DP' ? 'pelunasan' : 'pembayaran'}.`,
        confirmButtonText: 'OK'
      })
    } finally {
      setIsRejectingPelunasan(false)
    }
  }

  const handleRejectDp = async () => {
    if (isRejectingDp) return
    if (!dpProofAvailable) return
    if (!dpProofViewed) {
      await Swal.fire({
        icon: 'info',
        title: 'Lihat bukti terlebih dahulu',
        text: 'Silakan lihat bukti DP sebelum menolak.',
        confirmButtonText: 'OK'
      })
      return
    }

    const confirmResult = await Swal.fire({
      title: 'Tolak bukti DP?',
      text: 'User harus mengunggah ulang bukti DP setelah penolakan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, tolak',
      cancelButtonText: 'Batal'
    })

    if (!confirmResult.isConfirmed) {
      return
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      await Swal.fire({
        icon: 'error',
        title: 'Sesi berakhir',
        text: 'Silakan login ulang sebagai admin untuk melanjutkan.',
        confirmButtonText: 'OK'
      })
      return
    }

    try {
      setIsRejectingDp(true)
      const response = await fetch(`/api/reservations/${reservation.id}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
  body: JSON.stringify({ action: 'REJECT_DP', adminNotes: 'Ditolak oleh admin' })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData?.error || 'Gagal menolak bukti DP')
      }

      await Swal.fire({
        icon: 'success',
        title: 'Bukti DP ditolak',
        text: 'Bukti DP ditolak, user harus melakukan reservasi ulang.',
        confirmButtonText: 'OK'
      })

  // Notify parent that DP was rejected; map to REJECT_DP for backward compat
  onStatusUpdate(reservation.id, 'REJECT_DP')
    } catch (error) {
      console.error('Error rejecting DP proof:', error)
      await Swal.fire({
        icon: 'error',
        title: 'Gagal menolak bukti',
        text: error instanceof Error ? error.message : 'Terjadi kesalahan saat menolak bukti DP.',
        confirmButtonText: 'OK'
      })
    } finally {
      setIsRejectingDp(false)
    }
  }

  const handleStatusUpdate = async (status: string) => {
    setIsUpdating(true)
    try {
      // pass a default admin note for admin-triggered status updates
      await onStatusUpdate(reservation.id, status, 'Diubah oleh admin')
    } catch (error) {
      console.error('Error updating payment status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'FULL_SENT': return 'bg-blue-100 text-blue-800'
      case 'FULL_REJECTED': return 'bg-red-100 text-red-800'
      case 'DP_PAID': return 'bg-blue-100 text-blue-800'
      case 'PELUNASAN_SENT': return 'bg-purple-100 text-purple-800'
      case 'REFUNDED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID': return 'Lunas'
      case 'PENDING': return 'Menunggu'
      case 'FULL_SENT': return 'Bukti Lunas Terkirim'
      case 'FULL_REJECTED': return 'Ditolak Admin'
      case 'DP_PAID': return 'DP Terbayar'
      case 'PELUNASAN_SENT': return 'Pelunasan Terkirim'
      case 'REFUNDED': return 'Cancelled'
      default: return status
    }
  }

  const totalPrice = reservation.total_price ?? 0
  const paymentAmount = reservation.payment_amount ?? 0
  const remaining = totalPrice - paymentAmount

  const fallbackDpAdmin = reservation.payment_type === 'DP' && reservation.payment_status === 'DP_PAID'
    ? reservation.payment_validated_admin
    : null
  const fallbackDpAt = reservation.payment_type === 'DP' && reservation.payment_status === 'DP_PAID'
    ? reservation.payment_validated_at
    : null

  const dpValidatorAdmin = reservation.dp_validated_admin ?? fallbackDpAdmin
  const dpValidatorAt = reservation.dp_validated_at ?? fallbackDpAt

  const fallbackPelunasanAdmin = reservation.payment_type === 'DP'
    ? (reservation.payment_status === 'PAID' ? reservation.payment_validated_admin : null)
    : reservation.payment_validated_admin
  const fallbackPelunasanAt = reservation.payment_type === 'DP'
    ? (reservation.payment_status === 'PAID' ? reservation.payment_validated_at : null)
    : reservation.payment_validated_at

  const pelunasanValidatorAdmin = reservation.pelunasan_validated_admin ?? fallbackPelunasanAdmin
  const pelunasanValidatorAt = reservation.pelunasan_validated_at ?? fallbackPelunasanAt

  const renderValidatorRow = (
    label: string,
    admin?: { id: number; name: string; email: string } | null,
    timestamp?: string | null
  ) => {
    const formattedDate = timestamp
      ? `${new Date(timestamp).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })} • ${new Date(timestamp).toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit'
        })}`
      : null

    return (
      <div className="flex justify-between items-start">
        <span className="text-xs text-gray-600 pt-0.5">{label}</span>
        {admin?.name ? (
          <div className="text-right">
            <span className="block text-xs font-medium text-gray-900">{admin.name}</span>
            {formattedDate && (
              <span className="block text-[10px] text-gray-500">{formattedDate}</span>
            )}
          </div>
        ) : (
          <span className="text-xs font-medium text-gray-900">Belum divalidasi</span>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Payment Status */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Status Pembayaran:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.payment_status)}`}>
              {getStatusText(reservation.payment_status)}
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Tipe Pembayaran:</span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
            reservation.payment_type === 'DP' 
              ? 'bg-blue-100 text-blue-800 border border-blue-300' 
              : 'bg-green-100 text-green-800 border border-green-300'
          }`}>
            {reservation.payment_type === 'DP' ? 'DP' : 'Lunas'}
          </span>
        </div>
        {reservation.payment_type === 'DP' ? (
          <div className="space-y-2">
            {renderValidatorRow('Validasi DP:', dpValidatorAdmin, dpValidatorAt)}
            {renderValidatorRow('Validasi Pelunasan:', pelunasanValidatorAdmin, pelunasanValidatorAt)}
          </div>
        ) : (
          renderValidatorRow('Validasi Pembayaran:', pelunasanValidatorAdmin, pelunasanValidatorAt)
        )}

        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Total Harga:</span>
            <span className="text-sm font-medium text-gray-900">
              Rp {totalPrice.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Jumlah Pembayaran:</span>
            <span className="text-sm font-medium text-gray-900">
              Rp {paymentAmount.toLocaleString('id-ID')}
            </span>
          </div>
          {reservation.payment_type === 'DP' && (
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-blue-200">
              <span className="text-sm text-gray-600">Sisa Pembayaran:</span>
              <span className="text-sm font-medium text-gray-900">
                Rp {remaining.toLocaleString('id-ID')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Payment Notes (catatan dari pembayaran sebelumnya) */}
      {/* payment_notes hidden from UI by request (kept in DB) */}

      {/* Admin Actions (selalu muncul) */}
      <div className="space-y-3">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Bukti Pembayaran:</p>

          {reservation.payment_type === 'DP' ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleViewProof('dp')}
                disabled={!dpProofAvailable}
                className={dpProofAvailable ? smallPrimary : smallDisabled}
                title={dpProofAvailable ? 'Klik untuk melihat bukti DP' : 'Bukti DP belum tersedia'}
              >
                <Eye className="w-4 h-4" />
                <span>Bukti DP</span>
              </button>

              <button
                onClick={() => handleViewProof('pelunasan')}
                disabled={!pelunasanProofAvailable}
                className={pelunasanProofAvailable ? smallSecondary : smallDisabled}
                title={pelunasanProofAvailable ? 'Klik untuk melihat bukti pelunasan' : 'Bukti pelunasan belum tersedia'}
              >
                <Eye className="w-4 h-4" />
                <span>Bukti Pelunasan</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleViewProof('full')}
                disabled={!fullProofAvailable}
                className={fullProofAvailable ? smallPrimary : smallDisabled}
                title={fullProofAvailable ? 'Klik untuk melihat bukti pembayaran' : 'Bukti pembayaran belum tersedia'}
              >
                <Eye className="w-4 h-4" />
                <span>Bukti Pembayaran</span>
              </button>
              <div />
            </div>
          )}

          {reservation.payment_type === 'DP' && !dpProofAvailable && !pelunasanProofAvailable && (
            <p className="text-xs text-gray-500">Belum ada bukti pembayaran yang diunggah.</p>
          )}
        </div>

        {/* Admin notes input removed from UI by request (kept in DB) */}

        {shouldShowProofWarning && (
          <div className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md px-3 py-2">
            Lihat bukti terkait terlebih dahulu sebelum melakukan verifikasi atau pembatalan.
          </div>
        )}

  {/* Action buttons: responsive grid for consistent sizing and alignment */}
  <div className="grid grid-cols-2 gap-3 items-stretch">
          {/* Verifikasi DP (visible for all but disabled when not applicable) */}
          <button
            onClick={() => handleStatusUpdate('DP_PAID')}
            disabled={
              isUpdating ||
              isCancelledOrRejected ||
              reservation.payment_type !== 'DP' ||
              reservation.payment_status !== 'PENDING' ||
              noteText.includes('pelunasan') ||
              (dpProofAvailable && !dpProofViewed)
            }
            className={primary + ((isUpdating || isCancelledOrRejected || reservation.payment_type !== 'DP' || reservation.payment_status !== 'PENDING' || noteText.includes('pelunasan') || (dpProofAvailable && !dpProofViewed)) ? ' opacity-50 cursor-not-allowed' : '')}
          >
            <span>Verifikasi DP</span>
          </button>

          {/* Tolak Bukti DP */}
          <button
            onClick={handleRejectDp}
            disabled={isRejectingDp || isCancelledOrRejected || reservation.payment_type !== 'DP' || reservation.payment_status !== 'PENDING' || (dpProofAvailable && !dpProofViewed)}
            className={danger + ((isRejectingDp || isCancelledOrRejected || reservation.payment_type !== 'DP' || reservation.payment_status !== 'PENDING' || (dpProofAvailable && !dpProofViewed)) ? ' opacity-50 cursor-not-allowed' : '')}
          >
            <span>{isRejectingDp ? 'Memproses...' : 'Tolak Bukti DP'}</span>
          </button>

          {/* Verifikasi Lunas/Pelunasan */}
          <button
            onClick={() => handleStatusUpdate('PAID')}
            disabled={
              isUpdating ||
              isCancelledOrRejected ||
              reservation.payment_status === 'PAID' ||
              reservation.payment_status === 'PELUNASAN_PAID' ||
              (reservation.payment_type === 'DP' && (!canVerifyPelunasan || !pelunasanProofAvailable)) ||
              (reservation.payment_type === 'DP' && pelunasanProofAvailable && !pelunasanProofViewed) ||
              (!isDpReservation && fullProofAvailable && !fullProofViewed)
            }
            className={success + ((isUpdating || isCancelledOrRejected || reservation.payment_status === 'PAID' || reservation.payment_status === 'PELUNASAN_PAID' || (reservation.payment_type === 'DP' && (!canVerifyPelunasan || !pelunasanProofAvailable)) || (reservation.payment_type === 'DP' && pelunasanProofAvailable && !pelunasanProofViewed) || (!isDpReservation && fullProofAvailable && !fullProofViewed)) ? ' opacity-50 cursor-not-allowed' : '')}
          >
            <span>{reservation.payment_type === 'DP' ? 'Verifikasi Pelunasan' : 'Verifikasi Lunas'}</span>
          </button>

          {/* Tolak Bukti Pelunasan / Pembayaran */}
          <button
            onClick={handleRejectPelunasan}
            disabled={
              isRejectingPelunasan || 
              isCancelledOrRejected ||
              reservation.payment_status === 'PAID' ||
              reservation.payment_status === 'PELUNASAN_PAID' ||
              (reservation.payment_type === 'DP' && (!pelunasanProofAvailable || (pelunasanProofAvailable && !pelunasanProofViewed))) ||
              (reservation.payment_type === 'FULL' && (!fullProofAvailable || (fullProofAvailable && !fullProofViewed)))
            }
            className={
              danger + 
              ((isRejectingPelunasan || 
                isCancelledOrRejected ||
                reservation.payment_status === 'PAID' ||
                reservation.payment_status === 'PELUNASAN_PAID' ||
                (reservation.payment_type === 'DP' && (!pelunasanProofAvailable || (pelunasanProofAvailable && !pelunasanProofViewed))) ||
                (reservation.payment_type === 'FULL' && (!fullProofAvailable || (fullProofAvailable && !fullProofViewed)))
              ) ? ' opacity-50 cursor-not-allowed' : '')
            }
          >
            <span>
              {isRejectingPelunasan 
                ? 'Memproses...' 
                : reservation.payment_type === 'DP' 
                  ? 'Tolak Bukti Pelunasan'
                  : 'Tolak Bukti Pembayaran'
              }
            </span>
          </button>

          {/* Cancel / Refund (centered, spans two columns) */}
          <div className="col-span-2 flex justify-center">
            <button
              onClick={() => handleStatusUpdate('REFUNDED')}
              disabled={isUpdating || isCancelledOrRejected}
              className={centeredNeutral + ((isUpdating || isCancelledOrRejected) ? ' opacity-50 cursor-not-allowed' : '')}
            >
              <span>Cancel Pembayaran</span>
            </button>
          </div>
        </div>
        
        {/* Pesan jika sudah lunas */}
        {reservation.payment_status === 'PAID' && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 flex items-center space-x-2">
            <span>✅</span>
            <span className="font-medium">Pembayaran sudah lunas dan terverifikasi</span>
          </div>
        )}
        
        {/* Pesan jika cancelled atau rejected */}
        {isCancelledOrRejected && (
          <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 flex items-center space-x-2">
            <span>🚫</span>
            <span className="font-medium">
              {reservation.status === 'CANCELLED' 
                ? 'Booking sudah dibatalkan - tidak dapat melakukan validasi'
                : 'Booking sudah ditolak - tidak dapat melakukan validasi'
              }
            </span>
          </div>
        )}
      </div>

      {/* Modal Preview Bukti Pembayaran */}
      {showModal && activeProofUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden shadow-lg">
            <div className="flex justify-between items-center p-4 border-b">
              <div>
                <h3 className="text-lg font-medium">
                  {currentProofType === 'pelunasan' 
                    ? 'Bukti Pelunasan' 
                    : currentProofType === 'dp'
                    ? 'Bukti Pembayaran DP'
                    : 'Bukti Pembayaran'}
                </h3>
                {currentProofType === 'pelunasan' && reservation.pelunasan_sender_account_name && (
                  <p className="text-sm text-gray-600 mt-1">
                    Nama Rekening: <span className="font-semibold text-gray-900">{reservation.pelunasan_sender_account_name}</span>
                  </p>
                )}
                {(currentProofType === 'dp' || currentProofType === 'full') && reservation.dp_sender_account_name && (
                  <p className="text-sm text-gray-600 mt-1">
                    Nama Rekening: <span className="font-semibold text-gray-900">{reservation.dp_sender_account_name}</span>
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <img
                src={activeProofUrl}
                alt={currentProofType === 'pelunasan' ? 'Bukti Pelunasan' : 'Bukti Pembayaran'}
                className="max-w-full max-h-[70vh] object-contain mx-auto"
              />
            </div>
            <div className="flex justify-end space-x-2 p-4 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
