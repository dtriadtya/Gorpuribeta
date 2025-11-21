'use client'

import { useState, useEffect } from 'react'
import { Search, Menu, Clock, Calendar } from 'lucide-react'

interface AdminHeaderProps {
  title: string
  onMenuClick?: () => void
}

export default function AdminHeader({ title, onMenuClick }: AdminHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
      {/* Mobile menu button and Page Title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => {
            console.log('Hamburger button clicked')
            onMenuClick?.()
          }}
          className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{title}</h1>
      </div>

      {/* Right Side - Date & Time */}
      <div className="flex items-center space-x-3">
        {/* Date & Time Display - Desktop */}
        <div className="hidden md:flex items-center space-x-2">
          {/* Date Badge */}
          <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200">
            <Calendar className="w-4 h-4" />
            <span className="font-medium text-sm">{formatDate(currentTime)}</span>
          </div>
          {/* Time Badge */}
          <div className="flex items-center space-x-2 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-200">
            <Clock className="w-4 h-4" />
            <span className="font-mono font-semibold text-sm tabular-nums">{formatTime(currentTime)}</span>
          </div>
        </div>
        
        {/* Mobile: Time only */}
        <div className="md:hidden flex items-center space-x-2 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-200">
          <Clock className="w-4 h-4" />
          <span className="font-mono font-semibold text-sm tabular-nums">{formatTime(currentTime)}</span>
        </div>
      </div>
    </div>
  )
}
