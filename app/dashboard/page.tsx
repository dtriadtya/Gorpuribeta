'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, MapPin, User, Mail, Phone, UserCircle, Upload, CheckCircle2, Info, X, CheckCircle, XCircle, Clock as ClockIcon } from 'lucide-react';
import ChangePasswordModal from '@/components/ChangePasswordModal'
import Swal from 'sweetalert2'

interface Reservation {
  id: number
  field_name: string
  reservation_date: string
  start_time: string
  end_time: string
  total_price: number
  status: 'PENDING' | 'DP_SENT' | 'DP_PAID' | 'DP_REJECTED' | 'PELUNASAN_SENT' | 'PELUNASAN_PAID' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'
  payment_status: 'PENDING' | 'DP_SENT' | 'DP_PAID' | 'DP_REJECTED' | 'PELUNASAN_SENT' | 'PELUNASAN_PAID' | 'PAID' | 'REFUNDED'
  | 'PELUNASAN_REJECTED'
  payment_type?: string
  payment_amount?: number
  payment_proof?: string
  dp_proof?: string
  pelunasan_proof?: string
  payment_notes?: string
  notes?: string
  dp_validated_by?: number | null
  dp_validated_at?: string | null
  pelunasan_validated_by?: number | null
  pelunasan_validated_at?: string | null
  created_at: string
  updated_at: string
}

interface User {
  id: number
  name: string
  email: string
  phone?: string
  role: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false)
  const [uploadingReservationId, setUploadingReservationId] = useState<number | null>(null)
  const [selectedTimelineReservation, setSelectedTimelineReservation] = useState<Reservation | null>(null)
  const [uploadPaymentMethod, setUploadPaymentMethod] = useState<'BANK_TRANSFER' | 'QRIS'>('BANK_TRANSFER')
  const [isUploadPaymentMethodOpen, setIsUploadPaymentMethodOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const initializeDashboard = async () => {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 100)) // Give time for localStorage to be ready
      checkAuth()
    }
    initializeDashboard()

    // TIDAK PERLU periodic session check di dashboard
    // Session validation dilakukan oleh server saat API call
    // Jika ada session mismatch, akan tertangkap saat fetch data

  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      router.push('/login')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      
      // Fetch fresh user data from server to ensure we have latest field names
      await refreshUserProfile(token)
      
      fetchReservations(token)
    } catch (error) {
      console.error('Error parsing user data:', error)
      router.push('/login')
    }
  }

  const refreshUserProfile = async (token: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setUser(data.user)
          localStorage.setItem('user', JSON.stringify(data.user))
        }
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error)
    }
  }

  const fetchReservations = async (token: string) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      
      const response = await fetch(`/api/reservations?user_id=${userData.id_user}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        console.error('Failed to fetch reservations')
        setReservations([])
        return
      }

      const data = await response.json()
      const reservationsList = data.reservations || []
      
      // Urutkan dari terbaru ke terlama berdasarkan updated_at (status terakhir di-update)
      const sortedReservations = reservationsList.sort((a: Reservation, b: Reservation) => {
        const dateA = new Date(a.updated_at || a.created_at).getTime()
        const dateB = new Date(b.updated_at || b.created_at).getTime()
        return dateB - dateA // Yang baru di-update muncul di atas
      })
      
      setReservations(sortedReservations)
    } catch (error) {
      console.error('Error fetching reservations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    if (isNaN(price) || price === null || price === undefined) return 'Rp 0'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'DP_SENT':
        return 'bg-blue-100 text-blue-800'
      case 'DP_PAID':
        return 'bg-blue-200 text-blue-900'
      case 'DP_REJECTED':
        return 'bg-red-100 text-red-800'
      case 'PELUNASAN_SENT':
        return 'bg-purple-100 text-purple-800'
      case 'PELUNASAN_PAID':
        return 'bg-purple-200 text-purple-900'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'CANCELLED':
        return 'bg-orange-100 text-orange-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'FULL_SENT':
        return 'bg-blue-100 text-blue-800'
      case 'FULL_REJECTED':
        return 'bg-red-100 text-red-800'
      case 'DP_SENT':
        return 'bg-blue-100 text-blue-800'
      case 'DP_PAID':
        return 'bg-blue-200 text-blue-900'
      case 'DP_REJECTED':
        return 'bg-red-100 text-red-800'
      case 'PELUNASAN_SENT':
        return 'bg-purple-100 text-purple-800'
      case 'PELUNASAN_REJECTED':
        return 'bg-red-100 text-red-800'
      case 'PELUNASAN_PAID':
        return 'bg-purple-200 text-purple-900'
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'REFUNDED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Menunggu'
      case 'DP_SENT':
        return 'DP Terkirim'
      case 'DP_PAID':
        return 'DP Terbayar'
      case 'DP_REJECTED':
        return 'DP Ditolak'
      case 'PELUNASAN_SENT':
        return 'Pelunasan Terkirim'
      case 'PELUNASAN_PAID':
        return 'Pelunasan Terbayar'
      case 'REJECTED':
        return 'Ditolak Admin'
      case 'CANCELLED':
        return 'Dibatalkan'
      case 'COMPLETED':
        return 'Selesai'
      default:
        return status
    }
  }

  const getPaymentStatusText = (status: string, paymentType?: string) => {
    // Untuk pembayaran FULL
    if (paymentType !== 'DP') {
      switch (status) {
        case 'PENDING':
          return 'Menunggu Validasi'
        case 'FULL_SENT':
          return 'Menunggu Validasi'
        case 'PAID':
        case 'PELUNASAN_PAID':
          return 'Lunas'
        case 'DP_REJECTED':
        case 'FULL_REJECTED':
          return 'Ditolak Admin'
        case 'REFUNDED':
          return 'Dikembalikan'
        default:
          return status
      }
    }
    
    // Untuk pembayaran DP
    switch (status) {
      case 'PENDING':
        return 'Menunggu Validasi DP'
      case 'DP_SENT':
        return 'Menunggu Validasi DP'
      case 'DP_PAID':
        return 'DP Terbayar'
      case 'DP_REJECTED':
        return 'DP Ditolak'
      case 'PELUNASAN_SENT':
        return 'Pelunasan Terkirim'
      case 'PELUNASAN_REJECTED':
        return 'Pelunasan Ditolak'
      case 'PELUNASAN_PAID':
        return 'Pelunasan Terbayar'
      case 'PAID':
        return 'Lunas'
      case 'REFUNDED':
        return 'Dikembalikan'
      default:
        return status
    }
  }

  const handleUploadPelunasan = async (reservationId: number) => {
    // Reset dropdown state
    setUploadPaymentMethod('BANK_TRANSFER')
    setIsUploadPaymentMethodOpen(false)
    
    // Cari data reservasi
    const reservation = reservations.find(r => r.id === reservationId)
    if (!reservation) return

    // Hitung sisa pembayaran (50% dari total)
    const sisaPembayaran = reservation.total_price * 0.5
    const dpDibayar = reservation.payment_amount || (reservation.total_price * 0.5)
    
    // Cek jika ini upload ulang setelah ditolak
    const isPelunasanRejected = reservation.payment_status === 'PELUNASAN_REJECTED'
    const titleText = isPelunasanRejected ? 'Upload Ulang Bukti Pelunasan' : 'Upload Bukti Pelunasan'
    const warningHtml = isPelunasanRejected 
      ? `<div class="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-4 flex items-start space-x-3 shadow-sm">
          <div class="flex-shrink-0 text-yellow-500 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z"/>
              <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-sm text-yellow-900 leading-relaxed">
              <span class="font-semibold">Peringatan:</span> Pelunasan sebelumnya ditolak. Silakan upload bukti pembayaran yang benar.
            </p>
          </div>
        </div>`
      : ''

    const { value: file } = await Swal.fire({
      title: titleText,
      html: `
        <div class="text-left space-y-4">
          ${warningHtml}
          
          <!-- Sender Account Name Input - BARU -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nama Rekening Pengirim <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="pelunasanSenderAccountName"
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="Masukkan nama sesuai rekening pengirim"
              required
            />
            <p class="text-xs text-gray-500 mt-1.5">
              Nama harus sesuai dengan rekening yang digunakan untuk transfer
            </p>
          </div>
          
          <!-- Payment Method Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Pilih Metode Pembayaran
            </label>
            <div class="relative">
              <!-- Dropdown Button -->
              <button
                type="button"
                id="paymentMethodBtn"
                class="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 font-medium cursor-pointer hover:border-gray-400 transition-colors shadow-sm text-left flex items-center"
              >
                <svg id="selectedIcon" class="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span id="selectedText">Tunai</span>
                <svg id="chevronIcon" class="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <div 
                id="paymentMethodMenu"
                class="hidden absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg overflow-hidden"
                style="animation: fadeIn 0.2s ease-out;"
              >
                <style>
                  @keyframes fadeIn {
                    from {
                      opacity: 0;
                      transform: translateY(-10px);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }
                </style>
                <!-- Tunai Option -->
                <button
                  type="button"
                  data-value="BANK_TRANSFER"
                  class="payment-option w-full px-4 py-3 text-left flex items-center hover:bg-blue-50 transition-colors bg-blue-50"
                >
                  <svg class="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span class="flex-1 font-medium text-gray-900">Tunai</span>
                  <svg class="check-icon w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>

                <!-- QRIS Option -->
                <button
                  type="button"
                  data-value="QRIS"
                  class="payment-option w-full px-4 py-3 text-left flex items-center hover:bg-blue-50 transition-colors"
                >
                  <svg class="w-5 h-5 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <span class="flex-1 font-medium text-gray-900">QRIS</span>
                  <svg class="check-icon w-5 h-5 text-blue-600 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Bank/QRIS Info Card -->
          <div id="paymentInfo" class="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5">
            <div class="flex items-start space-x-3 mb-3">
              <div class="bg-blue-600 rounded-lg p-2">
                <svg id="paymentIcon" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
              </div>
              <div class="flex-1">
                <p id="paymentTitle" class="text-sm font-bold text-blue-900 mb-1">Informasi Rekening Transfer</p>
                <p id="paymentSubtitle" class="text-xs text-blue-700">Silakan transfer ke rekening berikut:</p>
              </div>
            </div>
            
            <!-- Bank Transfer Content -->
            <div id="bankContent" class="bg-white rounded-lg p-4 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-500">Bank</span>
                <span class="text-sm font-bold text-gray-900">BCA</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-500">No. Rekening</span>
                <span class="text-sm font-bold text-gray-900">3450763755</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-500">Atas Nama</span>
                <span class="text-sm font-bold text-gray-900">Rafael Nugroho</span>
              </div>
              <div class="flex justify-between items-center pt-2 border-t">
                <span class="text-xs font-medium text-gray-600">Total Harga</span>
                <span class="text-sm font-bold text-gray-900">${formatPrice(reservation.total_price)}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs font-medium text-gray-600">DP Terbayar (50%)</span>
                <span class="text-sm font-bold text-green-600">${formatPrice(dpDibayar)}</span>
              </div>
              <div class="flex justify-between items-center pt-2 border-t border-blue-200">
                <span class="text-sm font-bold text-gray-900">Jumlah Transfer</span>
                <span class="text-lg font-bold text-blue-600">${formatPrice(sisaPembayaran)}</span>
              </div>
            </div>

            <!-- QRIS Content (Hidden by default) -->
            <div id="qrisContent" class="bg-white rounded-lg p-4" style="display: none;">
              <div class="flex flex-col items-center">
                <div class="bg-white p-4 rounded-lg border-2 border-blue-200 mb-3">
                  <img 
                    src="/images/qris.jpeg" 
                    alt="QRIS Code" 
                    style="width: 256px; height: 256px; object-fit: contain;"
                    onerror="this.parentElement.innerHTML='<div style=\\'width:256px;height:256px;display:flex;align-items:center;justify-content:center;background:linear-gradient(to bottom right, #dbeafe, #e0e7ff);border-radius:0.5rem\\'><div style=\\'text-align:center\\'><svg style=\\'width:64px;height:64px;margin:0 auto 8px;color:#2563eb\\' fill=\\'none\\' stroke=\\'currentColor\\' viewBox=\\'0 0 24 24\\'><path stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'2\\' d=\\'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z\\'></path></svg><p style=\\'font-size:14px;font-weight:500;color:#1e3a8a\\'>QR Code QRIS</p><p style=\\'font-size:12px;color:#2563eb;margin-top:4px\\'>Scan untuk bayar</p></div></div>'"
                  />
                </div>
                <p class="text-sm text-gray-600 text-center mb-3 font-medium">Scan QR Code dengan aplikasi mobile banking</p>
                <div class="w-full border-t pt-3">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-xs font-medium text-gray-600">Total Harga</span>
                    <span class="text-sm font-bold text-gray-900">${formatPrice(reservation.total_price)}</span>
                  </div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-xs font-medium text-gray-600">DP Terbayar (50%)</span>
                    <span class="text-sm font-bold text-green-600">${formatPrice(dpDibayar)}</span>
                  </div>
                  <div class="flex justify-between items-center pt-2 border-t border-blue-200">
                    <span class="text-sm font-bold text-gray-900">Jumlah Bayar</span>
                    <span class="text-lg font-bold text-blue-600">${formatPrice(sisaPembayaran)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Upload Section -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Upload Bukti Transfer <span class="text-red-500">*</span>
            </label>
            <p class="text-xs text-gray-500 mb-3">Format: JPG, PNG, JPEG (Maksimal 5MB)</p>
          </div>
        </div>
        <style>
          .swal2-file {
            width: 100%;
            padding: 12px;
            border: 2px solid #d1d5db;
            border-radius: 8px;
            background-color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          }
          .swal2-file:hover {
            border-color: #9ca3af;
            background-color: #f9fafb;
          }
          .swal2-file:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          .swal2-file::file-selector-button {
            padding: 8px 16px;
            margin-right: 16px;
            border: none;
            border-radius: 6px;
            background-color: #3b82f6;
            color: white;
            font-weight: 500;
            font-size: 14px;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          .swal2-file::file-selector-button:hover {
            background-color: #2563eb;
          }
          .swal2-html-container {
            margin: 0 !important;
            padding: 0 1rem 1rem 1rem !important;
          }
          .swal2-title {
            font-size: 1.5rem !important;
            font-weight: 600 !important;
            color: #1f2937 !important;
            padding: 1.5rem 1.5rem 1rem 1.5rem !important;
          }
          .swal2-actions button {
            border-radius: 0.75rem !important;
            padding: 0.75rem 2rem !important;
            font-weight: 500 !important;
            font-size: 0.95rem !important;
          }
          .swal2-cancel {
            background-color: white !important;
            color: #374151 !important;
            border: 2px solid #d1d5db !important;
          }
          .swal2-cancel:hover {
            background-color: #f9fafb !important;
            border-color: #9ca3af !important;
          }
        </style>
      `,
      input: 'file',
      inputAttributes: {
        accept: 'image/*',
        'aria-label': 'Upload bukti pelunasan'
      },
      showCancelButton: true,
      confirmButtonText: 'Upload',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: 'transparent',
      width: '650px',
      customClass: {
        popup: 'rounded-xl'
      },
      preConfirm: (file) => {
        const senderNameInput = document.getElementById('pelunasanSenderAccountName') as HTMLInputElement
        const senderName = senderNameInput?.value?.trim()
        
        if (!file) {
          Swal.showValidationMessage('File bukti transfer wajib diupload')
          return false
        }
        
        return { file, senderName }
      },
      didOpen: () => {
        const paymentMethodBtn = document.getElementById('paymentMethodBtn')
        const paymentMethodMenu = document.getElementById('paymentMethodMenu')
        const chevronIcon = document.getElementById('chevronIcon')
        const paymentOptions = document.querySelectorAll('.payment-option')
        const bankContent = document.getElementById('bankContent')
        const qrisContent = document.getElementById('qrisContent')
        const paymentIcon = document.getElementById('paymentIcon')
        const paymentTitle = document.getElementById('paymentTitle')
        const paymentSubtitle = document.getElementById('paymentSubtitle')
        const selectedIcon = document.getElementById('selectedIcon')
        const selectedText = document.getElementById('selectedText')
        const senderNameInput = document.getElementById('pelunasanSenderAccountName') as HTMLInputElement
        const confirmButton = Swal.getConfirmButton()
        const fileInput = Swal.getInput()
        
        let currentMethod = 'BANK_TRANSFER'
        
        // Disable confirm button initially if sender name is empty
        const validateForm = () => {
          const hasName = senderNameInput?.value?.trim() !== ''
          const hasFile = fileInput?.files && fileInput.files.length > 0
          
          if (confirmButton) {
            if (hasName && hasFile) {
              confirmButton.removeAttribute('disabled')
            } else {
              confirmButton.setAttribute('disabled', 'true')
            }
          }
        }
        
        // Initial validation
        validateForm()
        
        // Add input event listeners
        if (senderNameInput) {
          senderNameInput.addEventListener('input', validateForm)
        }
        if (fileInput) {
          fileInput.addEventListener('change', validateForm)
        }
        
        // Toggle dropdown
        if (paymentMethodBtn && paymentMethodMenu && chevronIcon) {
          paymentMethodBtn.addEventListener('click', function(e: MouseEvent) {
            e.preventDefault()
            e.stopPropagation()
            
            const isHidden = paymentMethodMenu.classList.contains('hidden')
            if (isHidden) {
              paymentMethodMenu.classList.remove('hidden')
              if (chevronIcon) chevronIcon.style.transform = 'translateY(-50%) rotate(180deg)'
            } else {
              paymentMethodMenu.classList.add('hidden')
              if (chevronIcon) chevronIcon.style.transform = 'translateY(-50%) rotate(0deg)'
            }
          })
          
          // Close dropdown when clicking outside
          document.addEventListener('click', function(e: MouseEvent) {
            const target = e.target as Node
            if (paymentMethodMenu && !paymentMethodMenu.contains(target) && target !== paymentMethodBtn) {
              paymentMethodMenu.classList.add('hidden')
              if (chevronIcon) chevronIcon.style.transform = 'translateY(-50%) rotate(0deg)'
            }
          })
        }
        
        // Handle option selection
        paymentOptions.forEach(option => {
          option.addEventListener('click', function(this: Element, e: Event) {
            e.preventDefault()
            e.stopPropagation()
            
            const value = this.getAttribute('data-value')
            currentMethod = value || 'BANK_TRANSFER'
            
            // Update check icons
            paymentOptions.forEach(opt => {
              const checkIcon = opt.querySelector('.check-icon')
              if (opt === this) {
                opt.classList.add('bg-blue-50')
                if (checkIcon) checkIcon.classList.remove('hidden')
              } else {
                opt.classList.remove('bg-blue-50')
                if (checkIcon) checkIcon.classList.add('hidden')
              }
            })
            
            // Update button display
            if (value === 'QRIS') {
              if (selectedIcon) {
                selectedIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>'
                selectedIcon.classList.remove('text-blue-600')
                selectedIcon.classList.add('text-green-600')
              }
              if (selectedText) selectedText.textContent = 'QRIS'
              
              // Switch content
              if (bankContent) bankContent.style.display = 'none'
              if (qrisContent) qrisContent.style.display = 'block'
              if (paymentIcon) paymentIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>'
              if (paymentTitle) paymentTitle.textContent = 'Informasi QRIS'
              if (paymentSubtitle) paymentSubtitle.textContent = 'Scan QR Code di bawah ini untuk pembayaran:'
            } else {
              if (selectedIcon) {
                selectedIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />'
                selectedIcon.classList.remove('text-green-600')
                selectedIcon.classList.add('text-blue-600')
              }
              if (selectedText) selectedText.textContent = 'Tunai'
              
              // Switch content
              if (bankContent) bankContent.style.display = 'block'
              if (qrisContent) qrisContent.style.display = 'none'
              if (paymentIcon) paymentIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>'
              if (paymentTitle) paymentTitle.textContent = 'Informasi Rekening Transfer'
              if (paymentSubtitle) paymentSubtitle.textContent = 'Silakan transfer ke rekening berikut:'
            }
            
            // Close dropdown
            if (paymentMethodMenu) paymentMethodMenu.classList.add('hidden')
            if (chevronIcon) chevronIcon.style.transform = 'translateY(-50%) rotate(0deg)'
          })
        })
      }
    })

    if (file) {
      setUploadingReservationId(reservationId)

      const formData = new FormData()
      formData.append('file', (file as any).file)
      formData.append('reservationId', reservationId.toString())
      formData.append('paymentNotes', 'Bukti pelunasan pembayaran DP')
      formData.append('pelunasanSenderAccountName', (file as any).senderName)

      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/reservations/upload-payment', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        })

        const data = await response.json()

        if (response.ok) {
          await Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Bukti pelunasan berhasil diupload. Menunggu verifikasi admin.',
            confirmButtonColor: '#3b82f6'
          })

          // Refresh reservations
          if (token) fetchReservations(token)
        } else {
          throw new Error(data.error || 'Gagal upload bukti pelunasan')
        }
      } catch (error: any) {
        await Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: error.message || 'Terjadi kesalahan saat upload bukti pelunasan',
          confirmButtonColor: '#ef4444'
        })
      } finally {
        setUploadingReservationId(null)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* User Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start sm:items-center">
            <div className="flex items-center justify-center">
              <div className="group cursor-pointer transition-transform duration-300 hover:scale-105">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="60"
                height="60"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0518ebff"
                strokeWidth="0.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-colors duration-300 group-hover:stroke-[#3b82f6]"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="10" r="3" />
                <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
              </svg>
            </div>
            </div>
            <div className="ml-3 sm:ml-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">{user?.name || '—'}</h3>
              <p className="text-sm text-gray-700">{user?.email || '—'}</p>
              <p className="text-sm text-gray-600">{user?.phone || 'Belum ditambahkan'}</p>
            </div>
          </div>

          <button
            onClick={() => setIsChangePasswordModalOpen(true)}
            className="mt-4 sm:mt-0 w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Ganti Password
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Reservasi</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{reservations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Reservasi Aktif</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {reservations.filter((r) => r.status.toUpperCase() === 'CONFIRMED').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Pengeluaran</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {formatPrice(reservations.reduce((sum, r) => sum + r.total_price, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Riwayat Reservasi */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Riwayat Reservasi</h2>
          </div>

          {reservations.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {reservations.map((reservation) => (
                <div key={reservation.id} className="p-4 sm:p-6 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-medium text-gray-900">
                            {reservation.field_name}
                          </h3>
                          {/* Tampilkan hanya 1 badge berdasarkan payment_status (lebih detail) */}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(reservation.payment_status)}`}>
                            {getPaymentStatusText(reservation.payment_status, reservation.payment_type)}
                          </span>
                          
                          {/* Timeline Button - icon only di desktop, di sebelah badge */}
                          <button
                            onClick={() => setSelectedTimelineReservation(reservation)}
                            className="inline-flex items-center justify-center w-7 h-7 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
                            title="Lihat Timeline Pembayaran"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-0">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(reservation.reservation_date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{reservation.start_time} - {reservation.end_time}</span>
                        </div>
                      </div>

                      {reservation.notes && (
                        <p className="text-xs sm:text-sm text-gray-600 mt-2">
                          <strong>Catatan:</strong> {reservation.notes}
                        </p>
                      )}

                      {/* payment_notes hidden from UI by request (kept in DB) */}
                    </div>

                    <div className="mt-3 sm:mt-0 sm:ml-6 text-left sm:text-right flex flex-row items-center justify-between sm:justify-end gap-3">
                      <p className="text-sm sm:text-lg font-semibold text-gray-900">
                        {formatPrice(reservation.total_price)}
                      </p>
                      
                      {/* Tombol Upload Pelunasan - untuk semua reservasi DP */}
                      {reservation.payment_type === 'DP' && (
                        (() => {
                          const isUploading = uploadingReservationId === reservation.id
                          const hasPelunasanProof = Boolean(reservation.pelunasan_proof)
                          const isPelunasanPaid = reservation.payment_status?.toUpperCase() === 'PAID' || reservation.payment_status === 'PELUNASAN_PAID'
                          const isPelunasanRejected = reservation.payment_status === 'PELUNASAN_REJECTED'
                          const isPelunasanSent = reservation.payment_status === 'PELUNASAN_SENT'
                          const isPelunasanPendingReview = (hasPelunasanProof && !isPelunasanPaid && !isPelunasanRejected) || isPelunasanSent
                          const isReservationRejected = reservation.status === 'REJECTED'
                          const isReservationCancelled = reservation.status === 'CANCELLED'
                          // disable upload hanya jika: uploading, already paid, pending review (terkirim), atau booking rejected/cancelled
                          // TIDAK disable jika pelunasan ditolak (biar bisa upload ulang)
                          const buttonDisabled = isUploading || isPelunasanPaid || isPelunasanPendingReview || isReservationRejected || isReservationCancelled
                          const desktopLabel = isUploading
                            ? 'Mengupload...'
                            : isReservationRejected
                            ? 'Ditolak' // booking rejected
                            : isReservationCancelled
                            ? 'Dibatalkan'
                            : isPelunasanPaid
                            ? 'Pelunasan Lunas'
                            : isPelunasanRejected
                            ? 'Upload' // ✅ Bisa upload ulang
                            : isPelunasanPendingReview
                            ? 'Terkirim'
                            : 'Upload'
                          const mobileLabel = isUploading
                            ? '...'
                            : isReservationRejected
                            ? 'Ditolak'
                            : isReservationCancelled
                            ? 'Batal'
                            : isPelunasanPaid
                            ? 'Lunas'
                            : isPelunasanRejected
                            ? 'Upload Ulang' // ✅ Bisa upload ulang
                            : isPelunasanPendingReview
                            ? 'Terkirim'
                            : 'Pelunasan'

                          return (
                            <button
                              onClick={() => handleUploadPelunasan(reservation.id)}
                              disabled={buttonDisabled}
                              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-white rounded-lg transition-colors whitespace-nowrap ${
                                isPelunasanRejected 
                                  ? 'bg-orange-600 hover:bg-orange-700' // ✅ Warna orange untuk upload ulang
                                  : 'bg-blue-600 hover:bg-blue-700'
                              } disabled:bg-gray-400 disabled:cursor-not-allowed`}
                            >
                              {isUploading ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              ) : isPelunasanPaid || isPelunasanPendingReview ? (
                                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              ) : (
                                <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                              )}
                              <span className="hidden sm:inline">{desktopLabel}</span>
                              <span className="sm:hidden">{mobileLabel}</span>
                            </button>
                          )
                        })()
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 sm:p-12 text-center">
              <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-sm sm:text-lg font-medium text-gray-900 mb-2">Belum ada reservasi</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Riwayat reservasi Anda akan muncul di sini
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Modal */}
      {selectedTimelineReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Timeline Pembayaran</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedTimelineReservation.field_name}</p>
              </div>
              <button
                onClick={() => setSelectedTimelineReservation(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Info Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Tanggal Booking:</span>
                    <p className="font-semibold text-gray-900">{formatDate(selectedTimelineReservation.reservation_date)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Harga:</span>
                    <p className="font-semibold text-gray-900">{formatPrice(selectedTimelineReservation.total_price)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Metode Pembayaran:</span>
                    <p className="font-semibold text-gray-900">
                      {selectedTimelineReservation.payment_type === 'DP' ? 'DP (Down Payment)' : 'Pembayaran Penuh'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status Saat Ini:</span>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(selectedTimelineReservation.payment_status)}`}>
                      {getPaymentStatusText(selectedTimelineReservation.payment_status, selectedTimelineReservation.payment_type)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                  Riwayat Pembayaran
                </h4>
                
                <div className="relative ml-4 pl-8 space-y-8">
                  {/* Timeline Items based on payment_type and status */}
                  {(() => {
                    const timelineItems: JSX.Element[] = []
                    
                    if (selectedTimelineReservation.payment_type === 'DP') {
                      // 1. Booking Created (base)
                      timelineItems.push(
                        <TimelineItem
                          key="booking-created"
                          icon={<ClockIcon className="w-4 h-4" />}
                          iconColor="bg-gray-500"
                          title="Booking Dibuat"
                          description="Reservasi berhasil dibuat, menunggu pembayaran DP"
                          status="completed"
                        />
                      )

                      // 2. DP Sent (only if DP proof exists or was validated)
                      if (selectedTimelineReservation.dp_proof || selectedTimelineReservation.dp_validated_at || ['DP_SENT', 'DP_PAID', 'DP_REJECTED', 'PELUNASAN_SENT', 'PELUNASAN_PAID', 'PELUNASAN_REJECTED', 'PAID'].includes(selectedTimelineReservation.payment_status)) {
                        timelineItems.push(
                          <TimelineItem
                            key="dp-sent"
                            icon={<Upload className="w-4 h-4" />}
                            iconColor="bg-blue-500"
                            title="Bukti DP Dikirim"
                            description={`Bukti pembayaran DP sebesar ${formatPrice(selectedTimelineReservation.payment_amount || selectedTimelineReservation.total_price * 0.5)} telah diupload`}
                            status="completed"
                            timestamp={selectedTimelineReservation.created_at}
                          />
                        )
                      }

                      // 3. DP Validation - Always show if DP was sent (either still pending or already processed)
                      if (['DP_SENT', 'PENDING', 'DP_PAID', 'DP_REJECTED', 'PELUNASAN_SENT', 'PELUNASAN_PAID', 'PELUNASAN_REJECTED', 'PAID'].includes(selectedTimelineReservation.payment_status)) {
                        // If still pending validation
                        if (selectedTimelineReservation.payment_status === 'DP_SENT' || selectedTimelineReservation.payment_status === 'PENDING') {
                          timelineItems.push(
                            <TimelineItem
                              key="dp-validation"
                              icon={<ClockIcon className="w-4 h-4" />}
                              iconColor="bg-yellow-500"
                              title="Menunggu Validasi DP"
                              description="Bukti pembayaran DP sedang dalam proses verifikasi oleh admin. Harap menunggu konfirmasi."
                              status="pending"
                            />
                          )
                        } else {
                          // If already validated (approved or rejected), show as completed history
                          timelineItems.push(
                            <TimelineItem
                              key="dp-validation"
                              icon={<ClockIcon className="w-4 h-4" />}
                              iconColor="bg-blue-500"
                              title="Proses Validasi DP"
                              description="Bukti pembayaran DP telah diproses oleh admin"
                              status="completed"
                            />
                          )
                        }
                      }

                      // 4. DP Rejected
                      if (selectedTimelineReservation.payment_status === 'DP_REJECTED') {
                        timelineItems.push(
                          <TimelineItem
                            key="dp-rejected"
                            icon={<XCircle className="w-4 h-4" />}
                            iconColor="bg-red-500"
                            title="DP Ditolak Admin"
                            description="Bukti pembayaran DP ditolak oleh admin. Mohon lakukan reservasi ulang."
                            status="rejected"
                            timestamp={selectedTimelineReservation.dp_validated_at}
                          />
                        )
                      }

                      // 5. DP Approved
                      if (['DP_PAID', 'PELUNASAN_SENT', 'PELUNASAN_PAID', 'PELUNASAN_REJECTED', 'PAID'].includes(selectedTimelineReservation.payment_status)) {
                        timelineItems.push(
                          <TimelineItem
                            key="dp-approved"
                            icon={<CheckCircle className="w-4 h-4" />}
                            iconColor="bg-green-500"
                            title="DP Diverifikasi"
                            description="Pembayaran DP telah diverifikasi oleh admin"
                            status="completed"
                            timestamp={selectedTimelineReservation.dp_validated_at}
                          />
                        )
                      }

                      // 6. Pelunasan Sent (only if pelunasan proof exists or was validated)
                      if (selectedTimelineReservation.pelunasan_proof || selectedTimelineReservation.pelunasan_validated_at || ['PELUNASAN_SENT', 'PELUNASAN_PAID', 'PELUNASAN_REJECTED', 'PAID'].includes(selectedTimelineReservation.payment_status)) {
                        timelineItems.push(
                          <TimelineItem
                            key="pelunasan-sent"
                            icon={<Upload className="w-4 h-4" />}
                            iconColor="bg-purple-500"
                            title="Bukti Pelunasan Dikirim"
                            description={`Bukti pelunasan sebesar ${formatPrice(selectedTimelineReservation.total_price * 0.5)} telah diupload`}
                            status="completed"
                            timestamp={selectedTimelineReservation.pelunasan_validated_at}
                          />
                        )
                      }

                      // 7. Pelunasan Validation - Always show if pelunasan was sent
                      if (['PELUNASAN_SENT', 'PELUNASAN_PAID', 'PELUNASAN_REJECTED', 'PAID'].includes(selectedTimelineReservation.payment_status)) {
                        if (selectedTimelineReservation.payment_status === 'PELUNASAN_SENT') {
                          // Still pending
                          timelineItems.push(
                            <TimelineItem
                              key="pelunasan-validation"
                              icon={<ClockIcon className="w-4 h-4" />}
                              iconColor="bg-yellow-500"
                              title="Menunggu Verifikasi Admin"
                              description="Bukti pelunasan sedang dalam proses verifikasi oleh admin"
                              status="pending"
                            />
                          )
                        } else {
                          // Already validated
                          timelineItems.push(
                            <TimelineItem
                              key="pelunasan-validation"
                              icon={<ClockIcon className="w-4 h-4" />}
                              iconColor="bg-purple-500"
                              title="Proses Validasi Pelunasan"
                              description="Bukti pelunasan telah diproses oleh admin"
                              status="completed"
                            />
                          )
                        }
                      }

                      // 8. Pelunasan Rejected
                      if (selectedTimelineReservation.payment_status === 'PELUNASAN_REJECTED') {
                        timelineItems.push(
                          <TimelineItem
                            key="pelunasan-rejected"
                            icon={<XCircle className="w-4 h-4" />}
                            iconColor="bg-red-500"
                            title="Pelunasan Ditolak Admin"
                            description="Bukti pelunasan ditolak oleh admin. Silakan upload ulang dengan bukti yang benar."
                            status="rejected"
                            timestamp={selectedTimelineReservation.pelunasan_validated_at}
                          />
                        )
                      }

                      // 9. Pelunasan Approved
                      if (['PELUNASAN_PAID', 'PAID'].includes(selectedTimelineReservation.payment_status)) {
                        timelineItems.push(
                          <TimelineItem
                            key="pelunasan-approved"
                            icon={<CheckCircle className="w-4 h-4" />}
                            iconColor="bg-green-500"
                            title="Pelunasan Lunas"
                            description="Pembayaran pelunasan telah diverifikasi. Pembayaran selesai!"
                            status="completed"
                            timestamp={selectedTimelineReservation.pelunasan_validated_at}
                          />
                        )
                      }

                      // 10. Waiting for Pelunasan (after DP approved)
                      if (selectedTimelineReservation.payment_status === 'DP_PAID') {
                        timelineItems.push(
                          <TimelineItem
                            key="pending-pelunasan"
                            icon={<ClockIcon className="w-4 h-4" />}
                            iconColor="bg-yellow-500"
                            title="Menunggu Pelunasan"
                            description="DP sudah terbayar. Silakan upload bukti pelunasan untuk menyelesaikan pembayaran"
                            status="pending"
                          />
                        )
                      }
                    } else {
                      // FULL Payment Timeline
                      timelineItems.push(
                        <TimelineItem
                          key="booking-created"
                          icon={<ClockIcon className="w-4 h-4" />}
                          iconColor="bg-gray-500"
                          title="Booking Dibuat"
                          description="Reservasi berhasil dibuat, menunggu pembayaran penuh"
                          status="completed"
                        />
                      )

                      // Show payment sent only if payment_proof exists or payment was validated
                      if (selectedTimelineReservation.payment_proof || selectedTimelineReservation.dp_validated_at || ['DP_SENT', 'DP_PAID', 'DP_REJECTED', 'PAID', 'PENDING'].includes(selectedTimelineReservation.payment_status)) {
                        timelineItems.push(
                          <TimelineItem
                            key="payment-sent"
                            icon={<Upload className="w-4 h-4" />}
                            iconColor="bg-blue-500"
                            title="Bukti Pembayaran Dikirim"
                            description={`Bukti pembayaran penuh sebesar ${formatPrice(selectedTimelineReservation.total_price)} telah diupload`}
                            status="completed"
                            timestamp={selectedTimelineReservation.created_at}
                          />
                        )
                      }

                      // Show validation - Always show if payment was sent
                      if (['PENDING', 'DP_SENT', 'DP_REJECTED', 'PAID'].includes(selectedTimelineReservation.payment_status)) {
                        if (['PENDING', 'DP_SENT'].includes(selectedTimelineReservation.payment_status)) {
                          // Still pending
                          timelineItems.push(
                            <TimelineItem
                              key="payment-validation"
                              icon={<ClockIcon className="w-4 h-4" />}
                              iconColor="bg-yellow-500"
                              title="Menunggu Validasi Admin"
                              description="Bukti pembayaran sedang dalam proses verifikasi oleh admin. Harap menunggu konfirmasi."
                              status="pending"
                            />
                          )
                        } else {
                          // Already validated (approved or rejected)
                          timelineItems.push(
                            <TimelineItem
                              key="payment-validation"
                              icon={<ClockIcon className="w-4 h-4" />}
                              iconColor="bg-blue-500"
                              title="Proses Validasi Pembayaran"
                              description="Bukti pembayaran telah diproses oleh admin"
                              status="completed"
                            />
                          )
                        }
                      }

                      // Show rejection if payment was rejected
                      if (selectedTimelineReservation.payment_status === 'DP_REJECTED') {
                        timelineItems.push(
                          <TimelineItem
                            key="payment-rejected"
                            icon={<XCircle className="w-4 h-4" />}
                            iconColor="bg-red-500"
                            title="Pembayaran Ditolak Admin"
                            description="Bukti pembayaran ditolak oleh admin. Mohon lakukan reservasi ulang dengan bukti yang benar."
                            status="rejected"
                            timestamp={selectedTimelineReservation.dp_validated_at}
                          />
                        )
                      }

                      // Show payment verified if paid
                      if (selectedTimelineReservation.payment_status === 'PAID') {
                        timelineItems.push(
                          <TimelineItem
                            key="payment-verified"
                            icon={<CheckCircle className="w-4 h-4" />}
                            iconColor="bg-green-500"
                            title="Pembayaran Diverifikasi"
                            description="Pembayaran penuh telah diverifikasi. Pembayaran selesai!"
                            status="completed"
                            timestamp={selectedTimelineReservation.dp_validated_at}
                          />
                        )
                      }
                    }

                    // Reverse array untuk menampilkan dari terbaru ke terlama
                    return timelineItems.reverse()
                  })()}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setSelectedTimelineReservation(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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

// Timeline Item Component
function TimelineItem({ 
  icon, 
  iconColor, 
  title, 
  description, 
  status, 
  timestamp 
}: { 
  icon: React.ReactNode
  iconColor: string
  title: string
  description: string
  status: 'completed' | 'pending' | 'rejected'
  timestamp?: string | null
}) {
  return (
    <div className="relative group">
      {/* Icon Circle - positioned further from timeline border */}
      <div className={`absolute -left-[3rem] flex items-center justify-center w-9 h-9 rounded-full ${iconColor} text-white shadow-lg transition-transform group-hover:scale-110`}>
        {icon}
      </div>
      
      {/* Content */}
      <div className={`transition-opacity ${status === 'pending' ? 'opacity-70' : 'opacity-100'}`}>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
          <h5 className="font-semibold text-gray-900 text-base mb-2">{title}</h5>
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
          {timestamp && (
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-100">
              <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-xs text-gray-500 font-medium">
                {new Date(timestamp).toLocaleString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
