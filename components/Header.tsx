'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Check user data on mount and set up storage event listener
    const checkUserData = () => {
      console.log('🔍 Header: Checking user data...')
      const userData = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      
      console.log('📦 Header: User data:', userData ? 'exists' : 'null')
      console.log('🔑 Header: Token:', token ? 'exists' : 'null')
      
      if (userData && token) {
        try {
          const parsedUser = JSON.parse(userData)
          console.log('✅ Header: Setting user:', parsedUser.nama_user, '-', parsedUser.role)
          setUser(parsedUser)
        } catch (error) {
          console.error('❌ Header: Error parsing user data:', error)
          setUser(null)
        }
      } else {
        console.log('🚫 Header: No user data, setting null')
        setUser(null)
      }
    }

    // Initial check
    checkUserData()

    // Listen for storage changes
    window.addEventListener('storage', checkUserData)
    
    // Custom event listener for immediate updates
    window.addEventListener('userLogin', checkUserData)
    window.addEventListener('userLogout', checkUserData)

    return () => {
      window.removeEventListener('storage', checkUserData)
      window.removeEventListener('userLogin', checkUserData)
      window.removeEventListener('userLogout', checkUserData)
    }
  }, [])

  // 🔹 Tutup menu jika klik di luar area header/menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    if (isMenuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMenuOpen])

  /* ---------- NAVIGASI CENTER (DESKTOP) ---------- */
  const NavCenter = () => (
    <div className="hidden md:flex items-center space-x-8">
      <Link 
        href="/" 
        className={`px-3 py-2 rounded-lg transition-colors ${
          pathname === '/' 
            ? 'bg-blue-50 text-blue-600 font-medium' 
            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
        }`}
      >
        Beranda
      </Link>
      <Link 
        href="/fields" 
        className={`px-3 py-2 rounded-lg transition-colors ${
          pathname === '/fields' 
            ? 'bg-blue-50 text-blue-600 font-medium' 
            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
        }`}
      >
        Lapangan
      </Link>
      <Link 
        href="/information" 
        className={`px-3 py-2 rounded-lg transition-colors ${
          pathname === '/information' 
            ? 'bg-blue-50 text-blue-600 font-medium' 
            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
        }`}
      >
        Informasi
      </Link>
    </div>
  )

  // ✅ Fungsi logout dengan SweetAlert
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Panggil API logout untuk clear session token di database
      if (token) {
        console.log('🔓 Calling logout API...')
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        const data = await response.json()
        console.log('📡 Logout API response:', response.status, data)
      }

      // CRITICAL: Clear ALL localStorage data
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('unpaidReservations') // Clear reminder data
      
      // Set state to null immediately
      setUser(null)
      setIsMenuOpen(false)

      // Dispatch custom event untuk update UI
      window.dispatchEvent(new Event('userLogout'))

      // tampilkan alert sukses
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil Keluar',
        text: 'Anda telah berhasil keluar dari akun.',
        showConfirmButton: false,
        timer: 1500,
      })

      // Force reload to home page to clear all state
      window.location.href = '/'
    } catch (error) {
      console.error('Error during logout:', error)
      // Tetap hapus localStorage meskipun API gagal
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('unpaidReservations')
      setUser(null)
      
      // Dispatch custom event untuk update UI
      window.dispatchEvent(new Event('userLogout'))
      
      // Force reload
      window.location.href = '/'
    }
  }

  return (
    <header ref={menuRef} className="bg-white shadow-sm border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* LOGO */}
          <div className="flex items-center z-10">
            <Link href="/" className="flex items-center space-x-2" onClick={() => setIsMenuOpen(false)}>
              <img
                src="/images/logo gor puri beta.png"
                alt="Logo GOR Puri Beta"
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="text-xl font-bold text-gray-900">GOR Puri Beta</span>
            </Link>
          </div>

          {/* NAVIGASI TENGAH */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <NavCenter />
          </div>

          {/* TOMBOL AUTH */}
          <div className="hidden md:flex items-center space-x-4 z-10">
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    pathname === '/dashboard' 
                      ? 'bg-blue-50 text-blue-600 font-medium' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  Akun Saya
                </Link>
                <button onClick={handleLogout} className="btn-secondary">
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-primary-600">
                  Masuk
                </Link>
                <Link href="/register" className="btn-primary">
                  Daftar
                </Link>
              </>
            )}
          </div>

          {/* Tombol Mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden px-2 pt-2 pb-3 space-y-1 bg-white border-t">
            <Link 
              href="/" 
              className={`block px-3 py-2 rounded-md ${
                pathname === '/' 
                  ? 'bg-blue-50 text-blue-600 font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Beranda
            </Link>
            <Link 
              href="/fields" 
              className={`block px-3 py-2 rounded-md ${
                pathname === '/fields' 
                  ? 'bg-blue-50 text-blue-600 font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Lapangan
            </Link>
            <Link 
              href="/information" 
              className={`block px-3 py-2 rounded-md ${
                pathname === '/information' 
                  ? 'bg-blue-50 text-blue-600 font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Informasi
            </Link>

            {/* auth mobile */}
            <div className="border-t pt-3 mt-3">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Akun Saya
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Daftar
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
