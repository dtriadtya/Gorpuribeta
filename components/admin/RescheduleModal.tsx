'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, Clock, ArrowLeft, ArrowRight } from 'lucide-react'
import Swal from 'sweetalert2'

interface RescheduleModalProps {
  isOpen: boolean
  onClose: () => void
  reservation: {
    id: number
    field_id: number
    field_name: string
    user: { name: string }
    reservation_date: string
    start_time: string
    end_time: string
  }
  onSuccess: () => void
}

interface TimeSlot {
  time: string
  available: boolean
  status: 'available' | 'booked'
}

interface ScheduleData {
  date: string
  timeSlots: TimeSlot[]
}

const START_HOUR = 8
const END_HOUR = 22

export default function RescheduleModal({
  isOpen,
  onClose,
  reservation,
  onSuccess
}: RescheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([])
  const [adminNotes, setAdminNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showCalendar, setShowCalendar] = useState(true)
  const [scheduleData, setScheduleData] = useState<ScheduleData[]>([])

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

  useEffect(() => {
    if (isOpen && reservation.field_id) {
      fetchScheduleData(reservation.field_id)
      setSelectedDate('')
      setSelectedTimeSlots([])
      // adminNotes UI removed per user request; keep internal state empty
      setAdminNotes('')
      setShowCalendar(true)
    }
  }, [isOpen, reservation])

  // Auto refresh schedule data setiap 2 detik
  useEffect(() => {
    if (!isOpen || !reservation.field_id) return
    
    const interval = setInterval(() => {
      fetchScheduleData(reservation.field_id)
    }, 2000) // 2 detik

    return () => clearInterval(interval)
  }, [isOpen, reservation.field_id])

  const fetchScheduleData = async (fieldId: number) => {
    try {
      const res = await fetch(`/api/schedule?fieldId=${fieldId}&t=${Date.now()}`)
      if (res.ok) {
        const json = await res.json()
        setScheduleData(json.schedule)
      }
    } catch (e) {
      console.error('Error fetching schedule:', e)
    }
  }

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

  const getTimeSlotsForDate = (d: Date): TimeSlot[] => {
    const dateStr = formatDate(d)
    const dayData = scheduleData.find(s => s.date === dateStr)
    const slots: TimeSlot[] = []
    
    for (let h = START_HOUR; h < END_HOUR; h++) {
      const time = `${h.toString().padStart(2, '0')}:00`
      const found = dayData?.timeSlots.find(t => t.time === time)
      
      if (found) {
        slots.push(found)
      } else {
        const isPastTime = isToday(d) && h < new Date().getHours()
        slots.push({
          time,
          available: !isPastTime,
          status: !isPastTime ? 'available' : 'booked'
        })
      }
    }
    return slots
  }

  const handleTimeSlotClick = (time: string) => {
    if (selectedTimeSlots.length === 0) {
      setSelectedTimeSlots([time])
      return
    }
    if (selectedTimeSlots.includes(time)) {
      setSelectedTimeSlots([])
      return
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
      if (all[i].available) {
        range.push(all[i].time)
      } else {
        return // Ada slot yang tidak available di tengah range
      }
    }
    setSelectedTimeSlots(range)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedDate || selectedTimeSlots.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Tidak Lengkap',
        text: 'Harap pilih tanggal dan waktu untuk reschedule',
        confirmButtonColor: '#2563eb'
      })
      return
    }

    const startTime = selectedTimeSlots[0]
    const lastSlot = selectedTimeSlots[selectedTimeSlots.length - 1]
    const endHour = parseInt(lastSlot.split(':')[0]) + 1
    const endTime = `${endHour.toString().padStart(2, '0')}:00`

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/reservations/${reservation.id}/reschedule`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // adminNotes removed from UI; send a default message instead
        body: JSON.stringify({
          newDate: selectedDate,
          newStartTime: startTime,
          newEndTime: endTime,
          adminNotes: `Reschedule dari ${reservation.reservation_date} ${reservation.start_time}-${reservation.end_time}`
        })
      })

      const data = await response.json()

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Booking berhasil di-reschedule',
          confirmButtonColor: '#2563eb',
          timer: 2000
        })
        onSuccess()
        onClose()
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: data.error || 'Gagal melakukan reschedule',
          confirmButtonColor: '#2563eb'
        })
      }
    } catch (error) {
      console.error('Error rescheduling:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Terjadi kesalahan saat melakukan reschedule',
        confirmButtonColor: '#2563eb'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const days = generateCalendarDays()
  const weekdays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  const timeSlots = selectedDate ? getTimeSlotsForDate(parseDateString(selectedDate)) : []

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold">Reschedule Booking</h2>
            <p className="text-blue-100 text-sm mt-1">
              {reservation.field_name} - {reservation.user.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current Schedule Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Jadwal Saat Ini:</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(reservation.reservation_date).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{reservation.start_time} - {reservation.end_time}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Calendar / Time Slot Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {showCalendar ? 'Pilih Tanggal Baru' : 'Pilih Waktu Baru'}
                </h3>
                {!showCalendar && (
                  <button
                    type="button"
                    onClick={() => setShowCalendar(true)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                  >
                    <Calendar className="w-4 h-4 inline mr-1" /> Ubah Tanggal
                  </button>
                )}
              </div>

              {/* Calendar View */}
              {showCalendar && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h4 className="text-base font-semibold text-gray-900">
                      {currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                    </h4>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
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
                      const totalSlots = END_HOUR - START_HOUR
                      const bookedCount = dayData ? dayData.timeSlots.filter(t => t.status === 'booked').length : 0
                      const allBooked = bookedCount >= totalSlots
                      const disabled = isPast(d) || allBooked
                      const selected = selectedDate === dateStr
                      const today = isToday(d)

                      return (
                        <button
                          type="button"
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
                        </button>
                      )
                    })}
                  </div>

                  {/* Tips Section */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Tips:</strong> Pilih tanggal pada kalender untuk melihat slot waktu yang tersedia
                    </p>
                  </div>
                </div>
              )}

              {/* Time Slots View */}
              {!showCalendar && selectedDate && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Pilih Waktu - {parseDateString(selectedDate).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Klik waktu mulai, lalu klik waktu akhir untuk memilih range. Contoh ingin reschedule 2 jam maka klik 08:00 dan 09:00 dst.
                    </p>
                    
                    {/* Legend */}
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
                    </div>
                  </div>
                  
                  {/* Grid Time Slots - RESPONSIVE: 2 kolom HP, 4 kolom tablet/desktop */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {timeSlots.map((slot) => {
                      const selected = selectedTimeSlots.includes(slot.time)
                      const first = selectedTimeSlots[0] === slot.time
                      const last = selectedTimeSlots[selectedTimeSlots.length - 1] === slot.time
                      const inRange = selectedTimeSlots.length > 1 && selected && !first && !last

                      return (
                        <button
                          type="button"
                          key={slot.time}
                          onClick={() => handleTimeSlotClick(slot.time)}
                          disabled={!slot.available || slot.status === 'booked'}
                          className={`
                            p-2 sm:p-3 rounded-lg text-[11px] sm:text-sm font-medium transition-colors
                            ${selected 
                              ? 'bg-primary-600 text-white'
                              : slot.status === 'booked' 
                              ? 'bg-red-100 text-red-600 border border-red-200 cursor-not-allowed'
                              : slot.available 
                              ? 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                            ${first && selectedTimeSlots.length > 1 ? 'rounded-l-lg' : ''}
                            ${last && selectedTimeSlots.length > 1 ? 'rounded-r-lg' : ''}
                            ${inRange ? 'rounded-none' : ''}
                          `}
                        >
                          <div>{slot.time} - {String(parseInt(slot.time.split(':')[0]) + 1).padStart(2, '0')}:00</div>
                          <div className="text-[9px] sm:text-xs opacity-75 mt-0.5">
                            {slot.status === 'booked' ? 'Terbooking' : 'Tersedia'}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Summary Section - Only show when date and time selected */}
            {selectedDate && selectedTimeSlots.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">Ringkasan Reschedule:</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <div>
                    <span className="text-blue-600">Tanggal:</span>{' '}
                    <span className="font-medium">
                      {parseDateString(selectedDate).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-600">Waktu:</span>{' '}
                    <span className="font-medium">
                      {selectedTimeSlots[0]} - {
                        (() => {
                          const lastSlot = selectedTimeSlots[selectedTimeSlots.length - 1]
                          const endHour = parseInt(lastSlot.split(':')[0]) + 1
                          return `${endHour.toString().padStart(2, '0')}:00`
                        })()
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-600">Durasi:</span>{' '}
                    <span className="font-medium">{selectedTimeSlots.length} jam</span>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan Admin (Opsional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tambahkan catatan untuk reschedule ini..."
              />
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Perhatian:</strong> Pastikan jadwal baru tidak bentrok dengan booking lain.
                User akan menerima notifikasi perubahan jadwal.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Memproses...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
