'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import Hero from '@/components/Hero'
import FeaturedFields from '@/components/FeaturedFields'
import Features from '@/components/Features'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const checkUnpaidReservations = async () => {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      // Hanya cek jika user sudah login
      if (!token || !user) return
      
      // Cek apakah pop-up sudah pernah ditampilkan dalam sesi ini
      const popupShownKey = 'unpaidReservationsPopupShown'
      if (sessionStorage.getItem(popupShownKey) === 'true') {
        return // Pop-up sudah ditampilkan, skip
      }
      
      // Parse user data untuk mendapatkan user_id
      const userData = JSON.parse(user)
      const userId = userData.id_user
      
      try {
        // Fetch reservasi terbaru dari API dengan filter user_id
        const response = await fetch(`/api/reservations?user_id=${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (!response.ok) return
        
        const data = await response.json()
        
        // Ambil daftar ID reservasi yang sudah pernah ditampilkan di pop-up
        const seenReservationsKey = `seenRejectedReservations_${userId}`
        const seenReservations = JSON.parse(localStorage.getItem(seenReservationsKey) || '[]')
        
        // Filter reservasi yang belum lunas dan belum dibatalkan
        const filteredReservations = data.reservations.filter(
          (res: any) => {
            const notFullyPaid = res.payment_status !== 'PAID'
            const notCancelled = res.status !== 'CANCELLED'
            
            // Tetap tampilkan DP_REJECTED dan PELUNASAN_REJECTED meskipun booking.status = REJECTED
            // karena user perlu tahu untuk upload ulang
            const isRejectedPayment = res.payment_status === 'DP_REJECTED' || res.payment_status === 'PELUNASAN_REJECTED'
            
            if (isRejectedPayment) {
              // Jika REJECTED dan sudah pernah ditampilkan, skip
              if (res.status === 'REJECTED' && seenReservations.includes(res.id)) {
                return false
              }
              return notCancelled // Hanya exclude yang dibatalkan user
            }
            
            // Untuk status lain, exclude yang sudah ditolak admin juga
            const notRejected = res.status !== 'REJECTED'
            return notFullyPaid && notCancelled && notRejected
          }
        )
        
        // Sort berdasarkan updated_at (yang terbaru di-update muncul duluan)
        const sortedReservations = filteredReservations.sort((a: any, b: any) => {
          const dateA = new Date(a.updated_at || a.created_at).getTime()
          const dateB = new Date(b.updated_at || b.created_at).getTime()
          return dateB - dateA
        })
        
        // Ambil 2 teratas saja
        const unpaidReservations = sortedReservations.slice(0, 2)
        
        if (unpaidReservations.length > 0) {
          const totalUnpaid = filteredReservations.length
          // Show popup after a small delay to ensure page is loaded
          setTimeout(() => {
            Swal.fire({
              icon: 'warning',
              title: 'Pembayaran Tertunda',
              html: `
                <style>
                  .reminder-intro {
                    text-align: left;
                    font-size: 14px;
                    margin-bottom: 20px;
                    padding: 16px;
                    background: #FFFBEB;
                    border: 1px solid #FEF3C7;
                    border-radius: 12px;
                    line-height: 1.6;
                  }
                  .reminder-intro p {
                    color: #78350F;
                    margin: 0;
                  }
                  .reminder-intro strong {
                    font-weight: 600;
                    color: #78350F;
                  }
                  .reminder-intro .count-highlight {
                    font-weight: 700;
                    color: #92400E;
                  }
                  .reservation-item {
                    background: #F9FAFB;
                    border: 1px solid #E5E7EB;
                    border-radius: 10px;
                    padding: 14px 16px;
                    margin-bottom: 10px;
                    text-align: left;
                    transition: all 0.2s;
                  }
                  .reservation-item:hover {
                    background: #F3F4F6;
                    border-color: #D1D5DB;
                  }
                  .res-name {
                    font-size: 15px;
                    font-weight: 600;
                    color: #111827;
                    margin-bottom: 6px;
                  }
                  .res-detail {
                    font-size: 13px;
                    color: #6B7280;
                    margin-bottom: 3px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                  }
                  .res-icon {
                    width: 14px;
                    height: 14px;
                    flex-shrink: 0;
                  }
                  .status-badge {
                    display: inline-block;
                    padding: 3px 10px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 600;
                    margin-top: 4px;
                  }
                  .status-pending { background: #FEF3C7; color: #92400E; }
                  .status-dp { background: #DBEAFE; color: #1E40AF; }
                  .status-waiting { background: #FEF3C7; color: #92400E; }
                  .status-rejected { background: #FEE2E2; color: #991B1B; }
                  .res-list {
                    max-height: 300px;
                    overflow-y: auto;
                    padding-right: 4px;
                  }
                  .res-list::-webkit-scrollbar {
                    width: 6px;
                  }
                  .res-list::-webkit-scrollbar-track {
                    background: #F3F4F6;
                    border-radius: 10px;
                  }
                  .res-list::-webkit-scrollbar-thumb {
                    background: #D1D5DB;
                    border-radius: 10px;
                  }
                  .res-list::-webkit-scrollbar-thumb:hover {
                    background: #9CA3AF;
                  }
                </style>
                <div class="reminder-intro">
                  <p>
                    <strong>Peringatan:</strong> Anda memiliki reservasi yang menunggu pembayaran.
                  </p>
                </div>
                <div class="res-list">
                  ${unpaidReservations.map((res: any) => {
                    // Comprehensive status mapping
                    let statusText = 'Status Tidak Dikenal';
                    let statusClass = 'status-waiting';
                    
                    switch(res.payment_status) {
                      case 'PENDING':
                        statusText = 'Menunggu Validasi DP';
                        statusClass = 'status-waiting';
                        break;
                      case 'DP_SENT':
                        statusText = 'Menunggu Validasi DP';
                        statusClass = 'status-waiting';
                        break;
                      case 'DP_PAID':
                        statusText = 'DP Terbayar';
                        statusClass = 'status-dp';
                        break;
                      case 'DP_REJECTED':
                        statusText = 'DP Ditolak';
                        statusClass = 'status-rejected';
                        break;
                      case 'PELUNASAN_SENT':
                        statusText = 'Pelunasan Terkirim';
                        statusClass = 'status-waiting';
                        break;
                      case 'PELUNASAN_REJECTED':
                        statusText = 'Pelunasan Ditolak';
                        statusClass = 'status-rejected';
                        break;
                      case 'PELUNASAN_PAID':
                        statusText = 'Pelunasan Terbayar';
                        statusClass = 'status-dp';
                        break;
                      case 'PAID':
                        statusText = 'Lunas';
                        statusClass = 'status-dp';
                        break;
                      case 'REFUNDED':
                        statusText = 'Dikembalikan';
                        statusClass = 'status-rejected';
                        break;
                    }
                    
                    return `
                      <div class="reservation-item">
                        <div class="res-name">${res.field_name || res.field?.name || 'Lapangan'}</div>
                        <div class="res-detail">
                          <svg class="res-icon" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                          </svg>
                          ${new Date(res.reservation_date).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })} • ${res.start_time} - ${res.end_time}
                        </div>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              `,
              confirmButtonText: 'Lihat Detail',
              showCancelButton: true,
              cancelButtonText: 'Nanti',
              confirmButtonColor: '#2563eb',
              cancelButtonColor: '#9CA3AF',
              width: '480px',
              customClass: {
                popup: 'swal-popup-custom',
                title: 'swal-title-custom',
                htmlContainer: 'swal-html-custom',
                confirmButton: 'swal-btn-custom',
                cancelButton: 'swal-btn-cancel-custom'
              },
              didOpen: () => {
                const style = document.createElement('style');
                style.textContent = `
                  .swal-popup-custom {
                    border-radius: 16px;
                    padding: 0;
                  }
                  .swal-title-custom {
                    font-size: 22px;
                    font-weight: 700;
                    color: #111827;
                    padding: 24px 24px 12px 24px;
                  }
                  .swal-html-custom {
                    margin: 0 !important;
                    padding: 0 24px 20px 24px !important;
                  }
                  .swal-btn-custom {
                    border-radius: 8px !important;
                    padding: 10px 24px !important;
                    font-weight: 600 !important;
                    font-size: 14px !important;
                  }
                  .swal-btn-cancel-custom {
                    border-radius: 8px !important;
                    padding: 10px 24px !important;
                    font-weight: 600 !important;
                    font-size: 14px !important;
                  }
                  .swal2-icon.swal2-warning {
                    border-color: #F59E0B !important;
                    color: #F59E0B !important;
                    margin: 20px auto 8px !important;
                  }
                  .swal2-actions {
                    padding: 0 24px 24px 24px !important;
                  }
                `;
                document.head.appendChild(style);
              }
            }).then((result) => {
              // Tandai bahwa pop-up sudah ditampilkan dalam sesi ini
              sessionStorage.setItem('unpaidReservationsPopupShown', 'true')
              
              // Simpan ID reservasi yang REJECTED/CANCELLED ke localStorage
              // agar tidak muncul lagi di pop-up berikutnya
              const rejectedIds = unpaidReservations
                .filter((res: any) => 
                  (res.payment_status === 'DP_REJECTED' || res.payment_status === 'PELUNASAN_REJECTED') 
                  && res.status === 'REJECTED'
                )
                .map((res: any) => res.id)
              
              if (rejectedIds.length > 0) {
                const seenReservationsKey = `seenRejectedReservations_${userId}`
                const existingSeen = JSON.parse(localStorage.getItem(seenReservationsKey) || '[]')
                const combined = [...existingSeen, ...rejectedIds]
                const updatedSeen = Array.from(new Set(combined))
                localStorage.setItem(seenReservationsKey, JSON.stringify(updatedSeen))
              }
              
              if (result.isConfirmed) {
                router.push('/dashboard')
              }
            })
          }, 500) // Delay 500ms after page load
        }
      } catch (error) {
        console.error('Error fetching unpaid reservations:', error)
      }
    }
    
    checkUnpaidReservations()
  }, [router])

  return (
    <div>
      <Hero />
      <FeaturedFields />
      <Features />
    </div>
  )
}
