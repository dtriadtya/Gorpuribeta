'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'
import AdminHeader from '@/components/admin/Header'
import { Eye, Search, Bell, User, CreditCard, Download, X, ChevronDown, Calendar } from 'lucide-react'
import BookingDetailModal from '@/components/admin/BookingDetailModal'
import RescheduleModal from '@/components/admin/RescheduleModal'
import Swal from 'sweetalert2'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useRef } from 'react'

interface User {
  id: number
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  phone?: string
  createdAt: string
}

interface Reservation {
  id: number
  user_id: number
  field_id: number
  field_name: string
  reservation_date: string
  start_time: string
  end_time: string
  total_price: number
  status: 'PENDING' | 'DP_SENT' | 'DP_PAID' | 'DP_REJECTED' | 'PELUNASAN_SENT' | 'PELUNASAN_PAID' | 'PELUNASAN_REJECTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'
  payment_status: 'PENDING' | 'FULL_SENT' | 'FULL_REJECTED' | 'DP_SENT' | 'DP_PAID' | 'DP_REJECTED' | 'PELUNASAN_SENT' | 'PELUNASAN_PAID' | 'PELUNASAN_REJECTED' | 'PAID' | 'REFUNDED'
  payment_type: 'FULL' | 'DP'
  payment_amount: number
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

export default function BookingManagement() {
  const [user, setUser] = useState<User | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sortDate, setSortDate] = useState('')
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPaymentProof, setSelectedPaymentProof] = useState<string | null>(null)
  const [selectedSenderName, setSelectedSenderName] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [rescheduleReservation, setRescheduleReservation] = useState<Reservation | null>(null)
  const router = useRouter()
  

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    console.log('Booking page auth check:', { token: !!token, userData: !!userData })

    if (!token || !userData) {
      console.log('No token or user data, redirecting to login')
      window.location.replace('/login')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      console.log('Parsed user:', parsedUser)

      if (parsedUser.role !== 'ADMIN') {
        console.log('User is not admin, redirecting to home')
        window.location.replace('/')
        return
      }

      setUser(parsedUser)
      fetchReservations()
    } catch (error) {
      console.error('Error parsing user data:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.replace('/login')
    }
  }, [])

  // Auto-refresh reservations every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchReservations()
    }, 5000) // 5 seconds

    return () => clearInterval(interval)
  }, [])

      //dropdown logic
        const dropdownRef = useRef<HTMLDivElement>(null)

      useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false)
          }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
          document.removeEventListener('mousedown', handleClickOutside)
        }
      }, [])

  // Fetch reservations data
  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {}
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/admin/reservations', { headers })
      
      if (response.status === 401) {
        console.log('❌ Unauthorized - redirecting to login')
        router.push('/login')
        return
      }
      
      if (response.ok) {
        const data = await response.json()
        // Sort reservations by updated_at descending (latest status update first)
        const sortedReservations: Reservation[] = (data.reservations || []).sort(
          (a: Reservation, b: Reservation) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )
        // Normalize payment fields to satisfy required interface
        const normalized = sortedReservations.map(r => ({
          ...r,
          payment_type: r.payment_type || 'FULL',
          payment_amount: typeof r.payment_amount === 'number' && !isNaN(r.payment_amount)
            ? r.payment_amount
            : r.total_price,
          payment_validated_by: r.payment_validated_by ?? null,
          payment_validated_at: r.payment_validated_at ?? null,
          payment_validated_admin: r.payment_validated_admin ?? null
        }))
        setReservations(normalized)
      }
    } catch (error) {
      console.error('Error fetching reservations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle payment status update
  const handlePaymentStatusUpdate = async (reservationId: number, status: string, notes?: string) => {
    if (status === 'REJECT_PELUNASAN' || status === 'REJECT_DP' || status === 'REJECT_FULL') {
      fetchReservations()
      setShowDetailModal(false)
      setSelectedReservation(null)
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        Swal.fire({
          icon: 'error',
          title: 'Tidak ada sesi',
          text: 'Silakan login ulang sebagai admin',
          confirmButtonColor: '#2563eb'
        })
        return
      }

      const response = await fetch(`/api/reservations/${reservationId}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paymentStatus: status, adminNotes: notes })
      })

      if (response.ok) {
        fetchReservations()
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Status pembayaran berhasil diperbarui',
          confirmButtonColor: '#2563eb',
          timer: 2000
        })
        // Tutup modal detail setelah verifikasi berhasil
        setShowDetailModal(false)
        setSelectedReservation(null)
      } else {
        const errorData = await response.json()
        if (response.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Tidak Terotorisasi',
            text: 'Sesi admin tidak valid. Login ulang diperlukan.',
            confirmButtonColor: '#2563eb'
          })
          return
        }
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: errorData.error || 'Gagal memperbarui status pembayaran',
          confirmButtonColor: '#2563eb'
        })
      }
    } catch (error) {
      console.error('Error updating payment status:', error)
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Terjadi kesalahan saat memperbarui status pembayaran',
        confirmButtonColor: '#2563eb'
      })
    }
  }

  // Handle export PDF
const handleExportPDF = () => {
  // Ambil dari reservations (bukan filteredReservations) agar tidak terpengaruh filter status
  // Filter: COMPLETED (lunas), CONFIRMED (menunggu pelunasan), atau CANCELLED dengan pembayaran yang sudah dibayar
  const confirmedReservations = reservations
    .filter(r => {
      // Status COMPLETED = sudah lunas
      const isCompleted = r.status === 'COMPLETED'
      // Status DP_PAID = sedang menunggu pelunasan (DP sudah dibayar)
      const isConfirmed = r.status === 'DP_PAID'
      
      // CANCELLED dengan pembayaran yang sudah dibayar (DP atau FULL)
      // REJECTED tidak dimasukkan ke PDF
      const isCancelledWithPayment = r.status === 'CANCELLED' && r.payment_status !== 'PENDING'
      
      // Filter by date range if set
      if (startDate || endDate) {
        const resDate = new Date(r.reservation_date)
        const start = startDate ? new Date(startDate + 'T00:00:00') : null
        const end = endDate ? new Date(endDate + 'T23:59:59') : null
        
        const matchesDate = (!start || resDate >= start) && (!end || resDate <= end)
        if (!matchesDate) return false
      }
      
      return isCompleted || isConfirmed || isCancelledWithPayment
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.reservation_date} ${a.start_time}`).getTime()
      const dateB = new Date(`${b.reservation_date} ${b.start_time}`).getTime()
      return dateA - dateB
    })

  if (confirmedReservations.length === 0) {
    alert('Tidak ada booking untuk diekspor.')
    return
  }

  // Hitung total pendapatan: 
  // - COMPLETED = total_price penuh
  // - DP_PAID = total_price penuh (DP sudah dibayar, menunggu pelunasan)
  // - CANCELLED (DP atau FULL) = total_price / 2 (50% dari total harga)
  const totalPendapatan = confirmedReservations.reduce((sum, r) => {
    let amount = r.total_price
    
    if (r.status === 'CANCELLED') {
      // CANCELLED selalu 50% (baik DP maupun FULL)
      amount = r.total_price / 2
    }
    
    return sum + amount
  }, 0)

  // Hitung total jam hanya untuk yang sudah LUNAS (COMPLETED)
  const completedReservations = confirmedReservations.filter(r => r.status === 'COMPLETED')
  
  const totalJam = completedReservations.reduce((sum, r) => {
    const start = new Date(`1970-01-01T${r.start_time}`)
    const end = new Date(`1970-01-01T${r.end_time}`)
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    return sum + diff
  }, 0)

  // === HITUNG TOTAL JAM TERSEWA PER LAPANGAN (hanya yang LUNAS) ===
  const jamPerLapangan: Record<string, number> = {}
  completedReservations.forEach((r) => {
    const start = new Date(`1970-01-01T${r.start_time}`)
    const end = new Date(`1970-01-01T${r.end_time}`)
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    jamPerLapangan[r.field_name] = (jamPerLapangan[r.field_name] || 0) + diff
  })

  // === AMBIL SEMUA LAPANGAN DARI DATA RESERVATIONS ===
  const semuaLapangan = Array.from(new Set(reservations.map(r => r.field_name))).sort()

  const start = startDate ? new Date(startDate).toLocaleDateString('id-ID') : '-'
  const end = endDate ? new Date(endDate).toLocaleDateString('id-ID') : '-'

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  // === HEADER ===
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('GOR Puri Beta', 105, 20, { align: 'center' })

  doc.setFontSize(13)
  doc.text('Rekap Pendapatan', 105, 27, { align: 'center' })

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Periode: ${start} s/d ${end}`, 105, 34, { align: 'center' })

  doc.setDrawColor(0)
  doc.setLineWidth(0.4)
  doc.line(20, 38, 190, 38)

  // === DATA TABEL ===
  const tableData = confirmedReservations.map((r, i) => {
    // Tentukan harga yang ditampilkan dan status pembayaran
    let displayPrice = r.total_price
    let statusPembayaran = 'Lunas'
    
    // Handle CANCELLED cases - selalu 50% dari total harga (baik DP maupun FULL)
    if (r.status === 'CANCELLED') {
      displayPrice = r.total_price / 2
      if (r.payment_type === 'DP') {
        statusPembayaran = 'DP (Cancelled)'
      } else {
        statusPembayaran = 'Lunas (Cancelled)'
      }
    } 
    // Normal cases (not cancelled)
    else {
      if (r.payment_type === 'DP') {
        if (r.payment_status === 'DP_PAID') {
          statusPembayaran = 'DP Terbayar'
        } else if (r.payment_status === 'PAID') {
          statusPembayaran = 'Lunas'
        }
      } else {
        statusPembayaran = 'Lunas'
      }
    }
    
    return [
      i + 1,
      new Date(r.reservation_date).toLocaleDateString('id-ID'),
      r.user.name,
      r.field_name,
      `${r.start_time} - ${r.end_time}`,
      statusPembayaran,
      `Rp ${displayPrice.toLocaleString('id-ID')}`,
    ]
  })

  const totalRowIndex = tableData.length        // indeks baris "Total Pemasukan"
tableData.push(
  ['', '', '', '', 'Total Pemasukan:', '', `Rp ${totalPendapatan.toLocaleString('id-ID')}`],
  ['', '', '', '', 'Total Jam Tersewa:', '', `${totalJam} jam`]
)

  autoTable(doc, {
    startY: 45,
    head: [['No', 'Tanggal', 'Customer', 'Lapangan', 'Jam Main', 'Status', 'Total']],
    body: tableData,
    theme: 'plain',
    styles: {
      fontSize: 9,
      cellPadding: { top: 2.5, right: 2, bottom: 2.5, left: 2 },
      valign: 'middle',
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      textColor: [0, 0, 0],
    },
    headStyles: {
      fontStyle: 'bold',
      halign: 'center',
      lineWidth: 0.3,
      textColor: [0, 0, 0],
      fillColor: [240, 240, 240],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },      // No
      1: { halign: 'center', cellWidth: 23 },     // Tanggal
      2: { halign: 'left', cellWidth: 38 },       // Customer
      3: { halign: 'left', cellWidth: 28 },       // Lapangan
      4: { halign: 'center', cellWidth: 25 },     // Jam Main
      5: { halign: 'center', cellWidth: 20 },     // Status
      6: { halign: 'right', cellWidth: 28 },      // Total
    },
    margin: { left: 20, right: 20 },
    didParseCell: (data: { row: { index: number }; cell: { styles: any } }) => {
  if (data.row.index === totalRowIndex || data.row.index === totalRowIndex + 1) {
    data.cell.styles.lineWidth = 0
    data.cell.styles.fontStyle = 'bold'
  }
},
  })



  // === FOOTER ===
  const pageHeight = doc.internal.pageSize.height
  doc.setFontSize(9)
  doc.setTextColor(80)
  doc.text(`Dibuat pada: ${new Date().toLocaleString('id-ID')}`, 20, pageHeight - 10)
  doc.text('Sistem Manajemen Booking Lapangan', 190, pageHeight - 10, { align: 'right' })

  doc.save(`Rekap_Pendapatan_${start}_${end}.pdf`)
}




  // Handle detail modal
  const handleShowDetail = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setShowDetailModal(true)
  }

  const handleCloseDetail = () => {
    setShowDetailModal(false)
    setSelectedReservation(null)
  }

  // Handle reschedule modal
  const handleShowReschedule = (reservation: Reservation) => {
    setRescheduleReservation(reservation)
    setShowRescheduleModal(true)
  }

  const handleCloseReschedule = () => {
    setShowRescheduleModal(false)
    setRescheduleReservation(null)
  }

  const handleRescheduleSuccess = () => {
    fetchReservations()
  }

  // Handle reject booking
  const handleRejectBooking = async (reservationId: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: 'Anda harus login terlebih dahulu'
        })
        return
      }

      const response = await fetch(`/api/admin/reservations/${reservationId}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to reject booking')
      }

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Booking berhasil ditolak',
        timer: 1500,
        showConfirmButton: false
      })

      fetchReservations()
    } catch (error) {
      console.error('Error rejecting booking:', error)
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal menolak booking'
      })
    }
  }

  // Handle payment proof modal
  const handleShowPaymentProof = (paymentProof: string, senderName?: string) => {
    setSelectedPaymentProof(paymentProof)
    setSelectedSenderName(senderName || null)
    setShowPaymentModal(true)
  }

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false)
    setSelectedPaymentProof(null)
    setSelectedSenderName(null)
  }

  // Filter reservations
  const filteredReservations = reservations.filter((reservation) => {
  const matchesSearch =
    reservation.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.field_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.user.phone?.includes(searchTerm)

  const matchesStatus = statusFilter === 'ALL' || reservation.status === statusFilter

  // ✅ Fix date filter logic
  const resDate = new Date(reservation.reservation_date)
  const start = startDate ? new Date(startDate + 'T00:00:00') : null
  const end = endDate ? new Date(endDate + 'T23:59:59') : null

  const matchesDate =
    (!start || resDate >= start) &&
    (!end || resDate <= end)

  return matchesSearch && matchesStatus && matchesDate
})



  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Format time
  const formatTime = (timeString: string) => {
    return timeString
  }

  // Get status color and text (reservation lifecycle, separate from payment)
  const getStatusInfo = (reservation: Reservation) => {
    // Jika booking dibatalkan atau ditolak, tampilkan status booking
    if (reservation.status === 'CANCELLED') {
      return { color: 'bg-orange-100 text-orange-800', text: 'Dibatalkan' }
    }
    if (reservation.status === 'REJECTED') {
      return { color: 'bg-red-100 text-red-800', text: 'Ditolak Admin' }
    }
    
    // Untuk payment_type FULL (Lunas), tampilkan status berdasarkan payment_status
    if (reservation.payment_type === 'FULL') {
      if (reservation.payment_status === 'PENDING') {
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Menunggu Validasi' }
      }
      if (reservation.payment_status === 'PAID') {
        return { color: 'bg-green-100 text-green-800', text: 'Lunas' }
      }
      // Fallback untuk status lain pada FULL payment
      return { color: 'bg-gray-100 text-gray-800', text: 'Menunggu Validasi' }
    }
    
    // Untuk payment_type DP, tampilkan status yang lebih detail
    const paymentStatus = reservation.payment_status
    switch (paymentStatus) {
      case 'PENDING':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Menunggu Validasi DP' }
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
      case 'PAID':
        return { color: 'bg-green-100 text-green-800', text: 'Lunas' }
      case 'REFUNDED':
        return { color: 'bg-red-100 text-red-800', text: 'Dikembalikan' }
      default:
        return { color: 'bg-gray-100 text-gray-800', text: paymentStatus }
    }
  }
  // Unified payment status badge (covers FULL & DP)
  const getPaymentStatusInfo = (paymentStatus: string) => {
    switch (paymentStatus) {
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
      case 'PELUNASAN_REJECTED':
        return { color: 'bg-red-100 text-red-800', text: 'Pelunasan Ditolak' }
      case 'PELUNASAN_PAID':
        return { color: 'bg-purple-200 text-purple-900', text: 'Pelunasan Terbayar' }
      case 'PAID':
        return { color: 'bg-green-100 text-green-800', text: 'Lunas' }
      case 'REFUNDED':
        return { color: 'bg-red-100 text-red-800', text: 'Dikembalikan' }
      default:
        return { color: 'bg-gray-100 text-gray-800', text: paymentStatus }
    }
  }

  // Determine payment method label - show actual payment type, not status
  const getPaymentMethodLabel = (reservation: Reservation) => {
    // Hanya tampilkan DP atau Lunas berdasarkan payment_type
    if (reservation.payment_type === 'DP') {
      return { color: 'bg-blue-100 text-blue-800', text: 'DP' }
    }
    return { color: 'bg-green-100 text-green-800', text: 'Lunas' }
  }

  // Status options untuk dropdown
  const statusOptions = [
    { value: 'ALL', label: 'Semua Status' },
    { value: 'PENDING', label: 'Menunggu' },
    { value: 'DP_SENT', label: 'DP Terkirim' },
    { value: 'DP_PAID', label: 'DP Terbayar' },
    { value: 'DP_REJECTED', label: 'DP Ditolak' },
    { value: 'PELUNASAN_SENT', label: 'Pelunasan Terkirim' },
    { value: 'PELUNASAN_REJECTED', label: 'Pelunasan Ditolak' },
    { value: 'PELUNASAN_PAID', label: 'Pelunasan Terbayar' },
    { value: 'REJECTED', label: 'Ditolak Admin' },
    { value: 'CANCELLED', label: 'Dibatalkan' },
    { value: 'COMPLETED', label: 'Lunas' }
  ]

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="lg:ml-64">
        <AdminHeader title="Manajemen Booking" onMenuClick={() => setSidebarOpen(true)} />

        <div className="p-6">
          {/* Filter & Search */}
          <div className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
              
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Cari booking..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Dropdown Status */}
              <div ref={dropdownRef} className="relative w-full sm:w-56">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-between w-full px-4 h-10 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                  >
                    <span className="text-sm text-gray-700">
                      {statusOptions.find((o) => o.value === statusFilter)?.label}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Dropdown dengan animasi fade */}
                  <div
                    className={`absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg transform transition-all duration-200 ${
                      isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
                    }`}
                  >
                    {statusOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setStatusFilter(opt.value)
                          setIsOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                          statusFilter === opt.value ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

              {/* Date Range + Clear */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm text-gray-700"
                  />
                  <span className="text-gray-500 text-sm">–</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm text-gray-700"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStartDate('')
                    setEndDate('')
                  }}
                  className="h-10 px-4 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 focus:ring-2 focus:ring-primary-500 transition"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>



{/* Booking List */}
<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
  {/* Header */}
  <div className="flex flex-wrap items-center justify-between gap-y-3 pl-4 pr-6 py-4 border-b border-gray-200 bg-white">
    {/* Kiri: Icon + Judul */}
    <div className="flex items-center">
      <div className="p-2 rounded-lg flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="currentColor"
          viewBox="0 0 16 16"
          className="text-gray-800"
        >
          <path
            fillRule="evenodd"
            d="M0 .5A.5.5 0 0 1 .5 0h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 0 .5m13 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m-13 2A.5.5 0 0 1 .5 2h8a.5.5 0 0 1 0 1h-8a.5.5 0 0 1-.5-.5m13 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m-13 2A.5.5 0 0 1 .5 4h10a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5m13 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m-13 2A.5.5 0 0 1 .5 6h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m13 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m-13 2A.5.5 0 0 1 .5 8h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m13 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m-13 2a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m13 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m-13 2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m13 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m-13 2a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5m13 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5"
          />
        </svg>
      </div>
      <h2 className="ml-3 text-lg font-semibold text-gray-800">Daftar Booking</h2>
    </div>

    {/* Kanan: Tombol Export */}
    <button
      onClick={handleExportPDF}
      className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-red-700 transition mr-2 sm:mr-4"
    >
      <Download className="w-4 h-4 mr-2" />
      <span className="hidden sm:inline">Export PDF</span>
      <span className="sm:hidden">PDF</span>
    </button>
  </div>



            {/* Table Section */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lapangan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jam</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">TIPE</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status Reservasi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReservations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        Tidak ada data booking
                      </td>
                    </tr>
                  ) : (
                    filteredReservations.map((reservation) => {
                      const statusInfo = getStatusInfo(reservation)
                      return (
                        <tr key={reservation.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{reservation.field_name}</div>

                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{reservation.user.name}</div>
                              <div className="text-sm text-gray-500">{reservation.user.phone || 'No phone'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(reservation.reservation_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Rp {reservation.total_price.toLocaleString('id-ID')}
                          </td>

                          {/* Metode Pembayaran */}
                          <td className="px-6 py-4 whitespace-nowrap text-center align-middle">
                            <span
                              className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium ${
                                reservation.payment_type === 'DP'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {reservation.payment_type === 'DP' ? 'DP' : 'Lunas'}
                            </span>
                          </td>

                          {/* Status Reservasi */}
                          <td className="px-6 py-4 whitespace-nowrap text-center align-middle">
                            <span
                              className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium ${getStatusInfo(reservation).color}`}
                            >
                              {getStatusInfo(reservation).text}
                            </span>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleShowDetail(reservation)}
                                className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${
                                  reservation.status === 'DP_PAID'
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Detail
                              </button>
                              {reservation.status !== 'CANCELLED' && reservation.status !== 'REJECTED' && (
                                <button
                                  onClick={() => handleShowReschedule(reservation)}
                                  className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                                  title="Reschedule booking"
                                >
                                  <Calendar className="w-3 h-3 mr-1" />
                                  Reschedule
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedReservation && (
        <BookingDetailModal
          reservation={selectedReservation}
          isOpen={showDetailModal}
          onClose={handleCloseDetail}
          onPaymentStatusUpdate={handlePaymentStatusUpdate}
          onDelete={fetchReservations}
        />
      )}

      {/* Payment Proof Modal */}
      {showPaymentModal && selectedPaymentProof && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Bukti Pembayaran</h3>
                <p className="text-sm text-gray-500">Klik download untuk menyimpan file</p>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={selectedPaymentProof}
                  download={`bukti-pembayaran-${Date.now()}.jpg`}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </a>
                <button onClick={handleClosePaymentModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
              <div className="p-4 bg-gray-50">
                <div className="relative">
                  <img
                    src={selectedPaymentProof}
                    alt="Bukti Pembayaran"
                    className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg shadow-lg"
                  />
                </div>
              </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleReservation && (
        <RescheduleModal
          isOpen={showRescheduleModal}
          onClose={handleCloseReschedule}
          reservation={rescheduleReservation}
          onSuccess={handleRescheduleSuccess}
        />
      )}
    </div>
  )
}