'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, Home } from 'lucide-react'
import Swal from 'sweetalert2'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [error, setError] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  const router = useRouter()

  // Get redirect parameter from URL
  const getRedirectPath = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return params.get('redirect')
    }
    return null
  }

  const carouselImages = [
    '/images/badminton.jpg',
    '/images/basket.jpg',
    '/images/futsal.jpg'
  ]

  // Carousel auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % carouselImages.length
      )
    }, 4000) // Change image every 4 seconds

    return () => clearInterval(interval)
  }, [])

  // Prevent double login
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')
        
        if (token && userData) {
          const user = JSON.parse(userData)
          // User already logged in, redirect to appropriate page
          const redirectPath = user.role === 'ADMIN' ? '/admin' : '/'
          window.location.href = redirectPath
          return
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        // Invalid data, clear storage
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
      
      // No token or error, show login form
      setIsCheckingAuth(false)
    }

    checkAuth()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // CRITICAL: Clear old data first before storing new login
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('unpaidReservations')
        
        // Small delay to ensure clearing is complete
        await new Promise(resolve => setTimeout(resolve, 50))
        
        // Now store new token and user data
        try {
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
          
          // Immediate verification
          const verifyToken = localStorage.getItem('token')
          const verifyUser = localStorage.getItem('user')
          
          if (!verifyToken || !verifyUser) {
            throw new Error('Failed to store authentication data')
          }
        } catch (storageError) {
          console.error('localStorage error:', storageError)
          setIsLoading(false)
          await Swal.fire({
            icon: 'error',
            title: 'Error Penyimpanan',
            text: 'Gagal menyimpan data login. Pastikan browser Anda mengizinkan cookies dan localStorage.',
            confirmButtonColor: '#2563eb'
          })
          return
        }
        
        // Check for unpaid reservations in background (don't wait for this)
        if (data.user.role !== 'ADMIN') {
          fetch('/api/reservations', {
            headers: {
              'Authorization': `Bearer ${data.token}`
            }
          })
          .then(res => res.json())
          .then(reservationsData => {
            // Show all reservations that are not fully paid, cancelled, or rejected
            // This includes: PENDING, DP_SENT, DP_PAID, DP_REJECTED, PELUNASAN_SENT, PELUNASAN_REJECTED, PELUNASAN_PAID
            const unpaidReservations = reservationsData.reservations.filter(
              (res: any) => {
                // Exclude if payment is fully paid
                const notFullyPaid = res.payment_status !== 'PAID';
                
                // Exclude if booking is cancelled or rejected
                const notCancelledOrRejected = res.status !== 'CANCELLED' && res.status !== 'REJECTED';
                
                return notFullyPaid && notCancelledOrRejected;
              }
            )
            if (unpaidReservations.length > 0) {
              localStorage.setItem('unpaidReservations', JSON.stringify(unpaidReservations))
            }
          })
          .catch(error => console.error('Error checking unpaid reservations:', error))
        }
        
        // Dispatch custom event to update Header
        window.dispatchEvent(new Event('userLogin'))
        
        // Determine redirect path
        const redirectParam = getRedirectPath()
        let redirectPath: string
        
        if (redirectParam) {
          redirectPath = redirectParam
        } else {
          redirectPath = data.user.role === 'ADMIN' ? '/admin' : '/'
        }
        
        // Set flag to prevent auth check issues during redirect
        sessionStorage.setItem('justLoggedIn', 'true')
        
        // Show quick success notification
        await Swal.fire({
          icon: 'success',
          title: 'Login Berhasil!',
          text: `Selamat datang, ${data.user.name}!`,
          confirmButtonColor: '#2563eb',
          timer: 1000,
          showConfirmButton: false,
        })

        // Additional small delay to ensure localStorage is fully written
        await new Promise(resolve => setTimeout(resolve, 100))

        // CRITICAL: Use window.location.href to force full reload
        // This ensures Header and all components get fresh data
        console.log('🚀 Redirecting to:', redirectPath)
        window.location.href = redirectPath
      } else {
        // Tampilkan error dari server
        setIsLoading(false)
        Swal.fire({
          icon: 'error',
          title: 'Login Gagal',
          text: data.error || 'Email atau password salah',
          confirmButtonColor: '#2563eb'
        })
      }
    } catch (error) {
      setIsLoading(false)
      Swal.fire({
        icon: 'error',
        title: 'Error Jaringan',
        text: 'Terjadi kesalahan jaringan. Silakan coba lagi.',
        confirmButtonColor: '#2563eb'
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Header */}
          <div className="flex items-center justify-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Login Sekarang!</h1>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="Masukkan email Anda"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="Masukkan password Anda"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Memproses...' : 'Login'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Belum punya akun?{' '}
                <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 underline">
                  Daftar disini
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Carousel Background */}
      <div className="hidden lg:block lg:flex-1 relative overflow-hidden">
        {carouselImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('${image}')`
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          </div>
        ))}
        
        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentImageIndex 
                  ? 'bg-white w-8' 
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
