'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react'
import Swal from 'sweetalert2'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [currentImage, setCurrentImage] = useState(0)

  const router = useRouter()

  // Check if already logged in - prevent double login
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        // Already logged in, redirect
        if (user.role === 'ADMIN') {
          router.replace('/admin')
        } else {
          router.replace('/')
        }
        // Keep loading state true to prevent flash of register form
        return
      } catch (error) {
        // Invalid data, clear storage
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setIsCheckingAuth(false)
      }
    } else {
      // No token, show register form
      setIsCheckingAuth(false)
    }
  }, [router])

  const images = ['/images/badminton.jpg', '/images/futsal.jpg', '/images/basket.jpg']

  // 🔁 Ganti gambar background setiap 5 detik
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [images.length])

  // 🔹 Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 🔍 Validasi password
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password Tidak Cocok',
        text: 'Password dan konfirmasi password tidak cocok',
        confirmButtonColor: '#2563eb'
      })
      return
    }

    // 🧩 Konfirmasi data sebelum kirim
    const confirm = await Swal.fire({
      title: 'Apakah data Anda sudah benar?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, lanjutkan!',
      cancelButtonText: 'Periksa lagi',
      confirmButtonColor: '#2563eb',
    })

    if (!confirm.isConfirmed) return
    setIsLoading(true)

    try {
      // 🟢 Kirim data register
      const resRegister = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        }),
      })

      const dataRegister = await resRegister.json()

      if (!resRegister.ok) {
        Swal.fire({
          icon: 'error',
          title: 'Pendaftaran Gagal',
          text: dataRegister.error || 'Terjadi kesalahan saat mendaftar',
          confirmButtonColor: '#2563eb'
        })
        return
      }

      // 🟢 Register sukses, token sudah ada di response
      if (dataRegister.token) {
        // Simpan token dan data user dari register response
        localStorage.setItem('token', dataRegister.token)
        localStorage.setItem('user', JSON.stringify(dataRegister.user))

        // Trigger custom event untuk update header
        window.dispatchEvent(new Event('userLogin'))

        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Akun Anda telah dibuat dan login otomatis.',
          showConfirmButton: false,
          timer: 1500
        })

        // 🔁 Redirect ke dashboard
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh() // Refresh router untuk memastikan state terupdate
        }, 1500)
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Pendaftaran Gagal',
          text: 'Akun berhasil dibuat, tapi terjadi kesalahan. Silakan login manual.',
          confirmButtonColor: '#2563eb'
        })
        // Arahkan ke halaman login manual
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error Jaringan',
        text: 'Terjadi kesalahan jaringan. Silakan coba lagi.',
        confirmButtonColor: '#2563eb'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 🔹 Handle perubahan input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
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

  // 🧱 UI
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 relative overflow-hidden">
      {/* Kiri - Form Daftar */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 z-10 relative">
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Lapangan Olahraga Puri Beta
          </h1>
          <p className="text-center text-gray-600 mb-6">Daftar Sekarang!</p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Nama Lengkap */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Masukkan nama lengkap Anda"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Masukkan email Anda"
                />
              </div>
            </div>

            {/* Telepon */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Telepon
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Masukkan nomor telepon Anda"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Masukkan password Anda"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Konfirmasi password Anda"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>

            {/* Tombol Daftar */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
            >
              {isLoading ? 'Memproses...' : 'Daftar'}
            </button>

            {/* Link ke Login */}
            <p className="text-sm text-gray-600 text-center mt-4">
              Sudah punya akun?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 underline">
                Masuk disini
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Kanan - Carousel Gambar */}
      <div className="hidden lg:block lg:flex-1 relative overflow-hidden">
        {images.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
              index === currentImage ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${img})` }}
          ></div>
        ))}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>
    </div>
  )
}
