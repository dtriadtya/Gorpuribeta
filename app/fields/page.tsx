'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Field {
  id: number
  name: string
  description: string
  price_per_hour: number
  image_url?: string
  facilities: string[]
}

export default function FieldsPage() {
  const [fields, setFields] = useState<Field[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFields = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/v1/fields', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setFields(data.fields || [])
    } catch (error) {
      console.error('Error fetching fields:', error)
      setError('Gagal memuat data lapangan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFields()
  }, [fetchFields])

  const formatPrice = (price: number) => {
    if (isNaN(price) || price === null || price === undefined) {
      return 'Rp 0'
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  // ---------------------
  // Loading State
  // ---------------------
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Lapangan Kami
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Pilih dari berbagai lapangan olahraga berkualitas tinggi dengan fasilitas lengkap
            </p>
          </div>

          {/* Skeleton Loading */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ---------------------
  // Error State
  // ---------------------
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Gagal Memuat Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchFields}
            className="px-4 py-2 rounded-lg text-white transition-colors"
            style={{ backgroundColor: '#0280c2' }}
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  // ---------------------
  // Main View
  // ---------------------
  return (
    <div className="min-h-screen bg-gray-50 py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Lapangan Kami
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Kami menyediakan lapangan olahraga yang nyaman dengan fasilitas lengkap untuk memenuhi kebutuhan Anda.
          </p>
        </div>

        {fields.length > 0 ? (
          <div className="flex justify-center">
            <div
              className={`grid gap-8 ${
                fields.length === 1
                  ? 'grid-cols-1 w-full max-w-2xl'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {fields.map((field) => (
                <div
                  key={field.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]"
                >
                  {field.image_url ? (
                    <img
                      src={field.image_url}
                      alt={field.name}
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-300 flex items-center justify-center text-gray-600">
                      Tidak ada gambar
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{field.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{field.description}</p>

                    <p className="text-2xl font-bold text-[#0280c2] mb-3">
                      {formatPrice(field.price_per_hour)}
                      <span className="text-sm text-gray-500 font-normal"> /jam</span>
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {field.facilities.map((f, i) => (
                        <span
                          key={i}
                          className="bg-blue-100 text-[#0280c2] text-sm px-3 py-1 rounded-full"
                        >
                          {f}
                        </span>
                      ))}
                    </div>

                    <Link
                      href={`/schedule?fieldId=${field.id}`}
                      className="block text-center font-medium py-2 px-4 rounded-lg text-white transition-all"
                      style={{
                        backgroundColor: '#0280c2',
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.backgroundColor = '#026da5'
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.backgroundColor = '#0280c2'
                      }}
                    >
                      Cek Ketersediaan Jadwal
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
  <div className="flex justify-center py-12">
    <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 flex items-start space-x-3 shadow-sm max-w-lg w-full">
      <div className="flex-shrink-0 text-yellow-500 mt-0.5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="currentColor"
          className="bi bi-exclamation-triangle"
          viewBox="0 0 16 16"
        >
          <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z" />
          <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z" />
        </svg>
      </div>
      <div>
        <p className="text-sm text-yellow-900 leading-relaxed">
          <span className="font-semibold">Peringatan:</span> Saat ini tidak ada lapangan yang
          <span className="font-semibold"> tersedia </span> karena tim kami sedang melakukan{' '}
          <span className="font-semibold">maintenance</span>. Silakan kunjungi kembali nanti.
        </p>
      </div>
    </div>
  </div>
)
}
      </div>
    </div>
  )
}
