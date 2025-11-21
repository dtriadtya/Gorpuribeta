'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, Clock, MapPin, ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Swal from 'sweetalert2'

interface Field {
  id: number
  name: string

  price_per_hour: number
  image_url: string
  description: string
}

interface TimeSlot {
  time: string
  available: boolean
  price: number
  status: 'available' | 'booked' | 'member'
  reservationId?: number
  memberInfo?: {
    name: string
    contactName: string
  }
}

interface ScheduleData {
  date: string
  timeSlots: TimeSlot[]
}

const START_HOUR = 8
const END_HOUR = 22

export default function SchedulePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fieldId = searchParams.get('fieldId')

  const [field, setField] = useState<Field | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([])
  const [scheduleData, setScheduleData] = useState<ScheduleData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showCalendar, setShowCalendar] = useState(true)

  /* ---------- helper ---------- */
  const formatDate = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dd}`
  }
  const parseDateString = (str: string) => {
    const [y, m, d] = str.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  const isToday = (d: Date) => d.toDateString() === new Date().toDateString()
  const isPast = (d: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return d < today
  }

  /* ---------- fetch ---------- */
  useEffect(() => {
    if (!fieldId) { router.push('/fields'); return }
    fetchFieldData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldId])

  const fetchFieldData = async () => {
    try {
      const res = await fetch(`/api/v1/fields?id=${fieldId}`)
      if (!res.ok) { router.push('/fields'); return }
      const json = await res.json()
      setField(json.field)
      await fetchScheduleData(json.field.id)
    } catch (e) {
      console.error(e)
      router.push('/fields')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchScheduleData = async (id: number) => {
    try {
      const res = await fetch(`/api/schedule?fieldId=${id}&t=${Date.now()}`)
      if (res.ok) {
        const json = await res.json()
        setScheduleData(json.schedule)
      }
    } catch (e) {
      console.error(e)
    }
  }

    /* ---------- 🕒 AUTO REFRESH setiap 2 detik ---------- */
useEffect(() => {
  if (!field) return
  const interval = setInterval(() => {
    fetchScheduleData(field.id)
  }, 2000) // 2 detik
  return () => clearInterval(interval)
}, [field])


  /* ---------- calendar ---------- */
  const generateCalendarDays = () => {
    const y = currentMonth.getFullYear()
    const m = currentMonth.getMonth()
    const firstDay = new Date(y, m, 1)
    const lastDay = new Date(y, m + 1, 0)
    const startDay = firstDay.getDay()
    const daysInMonth = lastDay.getDate()
    const days: (Date | null)[] = Array(startDay).fill(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(y, m, d))
    return days
  }

  const handlePrevMonth = () => {
    const next = new Date(currentMonth)
    next.setMonth(next.getMonth() - 1)
    const today = new Date()
    if (
      next.getFullYear() < today.getFullYear() ||
      (next.getFullYear() === today.getFullYear() && next.getMonth() < today.getMonth())
    ) return
    setCurrentMonth(next)
  }

  const handleNextMonth = () => {
    const next = new Date(currentMonth)
    next.setMonth(next.getMonth() + 1)
    setCurrentMonth(next)
  }

  const handleDateSelect = (d: Date | null) => {
    if (!d || isPast(d)) return
    setSelectedDate(formatDate(d))
    setSelectedTimeSlots([])
    setShowCalendar(false)
  }

  /* ---------- time slots ---------- */
  const getTimeSlotsForDate = (d: Date): TimeSlot[] => {
    const dateStr = formatDate(d)
    const dayData = scheduleData.find(s => s.date === dateStr)
    const slots: TimeSlot[] = []
    for (let h = START_HOUR; h < END_HOUR; h++) {
      const time = `${h.toString().padStart(2, '0')}:00`
      const found = dayData?.timeSlots.find(t => t.time === time)
      if (found) slots.push(found)
      else {
        const isPastTime = isPast(d) && h < new Date().getHours()
        slots.push({
          time,
          available: !isPastTime,
          price: field?.price_per_hour ?? 0,
          status: !isPastTime ? 'available' : 'booked'
        })
      }
    }
    return slots
  }

  const handleTimeSlotClick = (time: string) => {
    // Ambil slot info untuk cek apakah slot ini untuk member
    const slots = getTimeSlotsForDate(parseDateString(selectedDate))
    const clickedSlot = slots.find(s => s.time === time)
    
    // Jika slot untuk member, tampilkan info
    if (clickedSlot?.status === 'member') {
      Swal.fire({
        icon: 'info',
        title: 'Slot Member Reguler',
        html: `
          <div class="text-left">
            <p class="mb-2"><strong>Slot ini digunakan oleh member reguler:</strong></p>
            <p class="mb-1">👤 <strong>Nama:</strong> ${clickedSlot.memberInfo?.name}</p>
            <p class="mb-1">📞 <strong>Kontak:</strong> ${clickedSlot.memberInfo?.contactName}</p>
            <p class="mt-3 text-sm text-gray-600">Slot ini tidak tersedia untuk booking umum.</p>
          </div>
        `,
        confirmButtonColor: '#2563eb'
      })
      return
    }

    if (selectedTimeSlots.length === 0) {
      setSelectedTimeSlots([time])
      return
    }
    if (selectedTimeSlots.includes(time)) {
      setSelectedTimeSlots([]); return
    }
    const all = getTimeSlotsForDate(parseDateString(selectedDate))
    const first = selectedTimeSlots[0]
    const a = all.findIndex(s => s.time === first)
    const b = all.findIndex(s => s.time === time)
    if (a === -1 || b === -1) return
    const start = Math.min(a, b)
    const end = Math.max(a, b)
    const range: string[] = []
    for (let i = start; i <= end; i++) {
      if (all[i].available) range.push(all[i].time)
      else return
    }
    setSelectedTimeSlots(range)
  }

  /* ---------- price & booking ---------- */
  const calculateTotalPrice = () => {
    if (!field || selectedTimeSlots.length === 0) return 0
    return selectedTimeSlots.length * field.price_per_hour
  }

  const handleContinueToBooking = () => {
    if (!selectedDate || selectedTimeSlots.length === 0) return
    try {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      if (!token || !user) {
        Swal.fire({
          icon: 'warning',
          title: 'Perlu Login',
          text: 'Anda harus login terlebih dahulu untuk melanjutkan reservasi.',
          showCancelButton: true,
          confirmButtonText: 'Login',
          cancelButtonText: 'Batal',
          confirmButtonColor: '#2563eb'
        }).then(result => {
          if (result.isConfirmed) router.push('/login')
        })
        return
      }
    } catch (e) {
      console.error('Error checking auth state', e)
    }
    const startHour = parseInt(selectedTimeSlots[0].split(':')[0])
    const endHour = parseInt(selectedTimeSlots[selectedTimeSlots.length - 1].split(':')[0]) + 1

    const params = new URLSearchParams({
      fieldId: fieldId!,
      date: selectedDate,
      startTime: `${startHour.toString().padStart(2, '0')}:00`,
      endTime: `${endHour.toString().padStart(2, '0')}:00`,
      totalPrice: calculateTotalPrice().toString()
    })
    router.push(`/booking?${params.toString()}`)
  }

  /* ---------- render ---------- */
  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Memuat jadwal...</p>
      </div>
    </div>
  )
  if (!field) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Lapangan tidak ditemukan</h2>
        <Link href="/fields" className="btn-primary">Kembali ke Daftar Lapangan</Link>
      </div>
    </div>
  )

  const days = generateCalendarDays()
  const weekdays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => router.push('/fields')} className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{field.name}</h1>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Harga per jam</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency', currency: 'IDR', minimumFractionDigits: 0
                }).format(field.price_per_hour)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Warning Box */}
        <div className="mb-6 bg-yellow-50 border border-yellow-300 rounded-xl p-4 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 text-yellow-500 mt-0.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z" />
                <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-yellow-900 leading-relaxed">
                <span className="font-semibold">Peringatan:</span> Pastikan Anda sudah membaca
                <span className="font-semibold"> Ketentuan & Rules Booking </span>
                sebelum melakukan reservasi.
              </p>
              <div className="mt-3">
                <Link 
                  href="/information"
                  className="inline-flex items-center px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-sm font-semibold rounded-lg transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Baca Ketentuan & Rules
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT CARD */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {showCalendar ? 'Pilih Tanggal' : 'Pilih Waktu'}
                </h2>
                <div className="flex items-center space-x-2">
                  {!showCalendar && (
                    <button
                      onClick={() => setShowCalendar(true)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                    >
                      <Calendar className="w-4 h-4 inline mr-1" /> Ubah Tanggal
                    </button>
                  )}
                </div>
              </div>

              {/* kalender */}
              {showCalendar && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {weekdays.map(d => (
                      <div key={d} className="text-center text-sm font-medium text-gray-500 py-2">{d}</div>
                    ))}
                    {days.map((d, i) => {
  if (!d) return <div key={`empty-${i}`} className="p-3" />

  const dateStr = formatDate(d)
  const dayData = scheduleData.find(s => s.date === dateStr)

  // Hitung total jam (08:00–22:00 = 14 slot)
  const totalSlots = END_HOUR - START_HOUR

  // Hitung jumlah slot yang sudah booked atau member
  const bookedCount = dayData
    ? dayData.timeSlots.filter(t => t.status === 'booked' || t.status === 'member').length
    : 0

  // Jika semua slot penuh
  const allBooked = bookedCount >= totalSlots

  const disabled = isPast(d) || allBooked
  const selected = selectedDate === dateStr
  const today = isToday(d)

  return (
    <button
      key={i}
      onClick={() => handleDateSelect(d)}
      disabled={disabled}
      className={`
        p-3 rounded-lg text-sm font-medium transition-all
        ${
          selected
            ? 'bg-primary-600 text-white ring-2 ring-primary-300'
            : allBooked
            ? 'bg-red-100 text-red-500 cursor-not-allowed border border-red-200'
            : disabled
            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
            : today
            ? 'bg-blue-50 text-blue-600 border-2 border-blue-300 hover:bg-blue-100'
            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:ring-2 hover:ring-gray-200'
        }
      `}
    >
      <div>{d.getDate()}</div>
      {allBooked && (
        <div className="text-[10px] text-red-500 font-medium mt-1"></div>
      )}
    </button>
  )
})}

                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Tips:</strong> Pilih tanggal pada kalender untuk melihat slot waktu yang tersedia
                    </p>
                  </div>
                </>
              )}

              {/* slot waktu - RESPONSIVE */}
              {!showCalendar && selectedDate && (
                <>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Pilih Waktu - {parseDateString(selectedDate).toLocaleDateString('id-ID', {
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Klik waktu mulai, lalu klik waktu akhir untuk memilih range. Contoh ingin memesan 2 jam maka klik 08:00 dan 09:00 dst (Notes: Klik refresh agar jadawlnya ter-update).
                    </p>
                    <div className="flex items-center space-x-4 text-xs">
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded" />
                        <span className="text-gray-600">Tersedia</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-primary-600 rounded" />
                        <span className="text-gray-600">Terpilih</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-red-100 border border-red-200 rounded" />
                        <span className="text-gray-600">Terbooking</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded" />
                        <span className="text-gray-600">Member</span>
                      </div>
                    </div>
                  </div>

                  {/* GRID RESPONSIVE: 2 kolom HP, 4 kolom tablet/desktop */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {getTimeSlotsForDate(parseDateString(selectedDate)).map(slot => {
                      const selected = selectedTimeSlots.includes(slot.time)
                      const first = selectedTimeSlots[0] === slot.time
                      const last = selectedTimeSlots[selectedTimeSlots.length - 1] === slot.time
                      const inRange = selectedTimeSlots.length > 1 && selected && !first && !last
                      return (
                        <button
                          key={slot.time}
                          onClick={() => handleTimeSlotClick(slot.time)}
                          disabled={!slot.available || slot.status === 'booked' || slot.status === 'member'}
                          className={`
                            p-2 sm:p-3 rounded-lg text-[11px] sm:text-sm font-medium transition-colors
                            ${selected ? 'bg-primary-600 text-white'
                              : slot.status === 'booked' ? 'bg-red-100 text-red-600 border border-red-200 cursor-not-allowed'
                              : slot.status === 'member' ? 'bg-orange-100 text-orange-700 border border-orange-300 cursor-pointer hover:bg-orange-200'
                              : slot.available ? 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                            ${first && selectedTimeSlots.length > 1 ? 'rounded-l-lg' : ''}
                            ${last && selectedTimeSlots.length > 1 ? 'rounded-r-lg' : ''}
                            ${inRange ? 'rounded-none' : ''}
                          `}
                        >
                          <div>{slot.time} - {String(parseInt(slot.time.split(':')[0]) + 1).padStart(2, '0')}:00</div>
                          <div className="text-[9px] sm:text-xs opacity-75 mt-0.5">
                            {slot.status === 'booked' ? 'Terbooking' : slot.status === 'member' ? 'Member' : 'Tersedia'}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* RIGHT CARD - Ringkasan */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Lapangan</p>
                  <p className="font-medium text-gray-900">{field.name}</p>
                </div>

                {selectedDate && (
                  <div>
                    <p className="text-sm text-gray-600">Tanggal</p>
                    <p className="font-medium text-gray-900">
                      {parseDateString(selectedDate).toLocaleDateString('id-ID', {
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>
                )}

                {selectedTimeSlots.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Waktu</p>
                    <p className="font-medium text-gray-900">
                      {selectedTimeSlots[0]} - {String(parseInt(selectedTimeSlots[selectedTimeSlots.length - 1].split(':')[0]) + 1).padStart(2, '0')}:00
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedTimeSlots.length} jam
                    </p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency', currency: 'IDR', minimumFractionDigits: 0
                      }).format(calculateTotalPrice())}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleContinueToBooking}
                  disabled={!selectedDate || selectedTimeSlots.length === 0}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Lanjutkan ke Reservasi
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}