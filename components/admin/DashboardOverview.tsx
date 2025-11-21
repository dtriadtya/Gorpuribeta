'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

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
  status: 'PENDING' | 'DP_SENT' | 'DP_PAID' | 'DP_REJECTED' | 'PELUNASAN_SENT' | 'PELUNASAN_PAID' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'
  payment_status?: 'PENDING' | 'DP_SENT' | 'DP_PAID' | 'DP_REJECTED' | 'PELUNASAN_SENT' | 'PELUNASAN_PAID' | 'PAID' | 'REFUNDED'
}

interface MetricCardProps {
  title: string
  value: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  iconColor?: string
  bgColor?: string
  hideIcon?: boolean
}

function MetricCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-gray-600',
  bgColor = 'bg-gray-100',
  hideIcon = false
}: MetricCardProps) {
  const isDateCard =
    typeof value === 'string' &&
    (value.includes('/') || value.toLowerCase().includes('hari'))

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        {!hideIcon && Icon && (
          <div className={`p-2 ${bgColor} rounded-lg`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        )}
        <div className="ml-4 min-w-0">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p
            className={`${
              isDateCard
                ? 'text-lg font-bold text-gray-900'
                : 'text-2xl font-semibold text-gray-900'
            }`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

interface DashboardOverviewProps {
  bookingsToday: number
  activeFields: number
  totalRevenue?: number
  usersChange?: number
  bookingsChange?: number
  revenueChange?: number
  fieldsChange?: number
  reservations?: Reservation[]
}

export default function DashboardOverview({
  bookingsToday,
  activeFields,
  reservations = []
}: DashboardOverviewProps) {
  const [currentTime, setCurrentTime] = useState(
    new Date()
      .toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
      .replace(/\./g, ':')
  )

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
        .toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
        .replace(/\./g, ':')
      setCurrentTime(now)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const today = new Date()
  const formattedDate = today
    .toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    })
    .replace(/\./g, '/')

  const metrics = [
    {
      title: 'Tanggal Hari Ini',
      value: <span className="font-bold text-gray-900">{formattedDate}</span>,
      icon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="w-6 h-6 text-green-600"
        >
          <path d="M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2M1 3.857C1 3.384 1.448 3 2 3h12c.552 0 1 .384 1 .857v10.286c0 .473-.448.857-1 .857H2c-.552 0-1-.384-1-.857z"/>
          <path d="M6.5 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
        </svg>
      ),
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Jam Sekarang',
      value: currentTime,
      icon: Clock,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ]

  return null
}
