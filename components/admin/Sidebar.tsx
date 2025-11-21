'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Swal from 'sweetalert2'
import { 
  LayoutDashboard, 
  MapPin, 
  Calendar, 
  Users, 
  LogOut,
  Building2,
  X,
  UsersRound
} from 'lucide-react'

interface AdminSidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export default function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
  const pathname = usePathname()

  const menuItems = [
        {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard
    },
    {
      name: 'Booking',
      href: '/admin/booking',
      icon: Calendar
    },
    {
      name: 'Lapangan',
      href: '/admin/fields',
      icon: MapPin
    },
    {
      name: 'Member',
      href: '/admin/members',
      icon: UsersRound
    },
    {
      name: 'Pengguna',
      href: '/admin/users',
      icon: Users
    }
  ]

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Panggil API logout untuk clear session token di database
      if (token) {
        console.log('🔓 [Admin] Calling logout API...')
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        const data = await response.json()
        console.log('📡 [Admin] Logout API response:', response.status, data)
      }

      // CRITICAL: Clear ALL localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('unpaidReservations')
      
      // Show success notification (tanpa timer, perlu klik OK)
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil Keluar',
        text: 'Anda telah berhasil keluar dari panel admin.',
        confirmButtonColor: '#16a34a',
        confirmButtonText: 'OK'
      })

      // Redirect ke home setelah klik OK
      window.location.replace('/')
    } catch (error) {
      console.error('❌ [Admin] Error during logout:', error)
      // Tetap hapus localStorage dan redirect meskipun API gagal
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('unpaidReservations')
      
      // Show error but still redirect
      await Swal.fire({
        icon: 'warning',
        title: 'Keluar Berhasil',
        text: 'Anda telah keluar dari panel admin.',
        confirmButtonColor: '#16a34a',
        confirmButtonText: 'OK'
      })
      
      window.location.replace('/')
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`w-64 bg-white shadow-lg h-screen fixed left-0 top-0 z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
      {/* Brand */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                width="20"
                height="20"
                fill="white"
              >
                <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0"/>
                <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z"/>
              </svg>
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900">GOR Puri Beta</h1>
              <p className="text-sm text-gray-500">Admin Reservation</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Menu */}
      <div className="p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Menu Utama
        </h3>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Keluar</span>
        </button>
      </div>
      </div>
    </>
  )
}
