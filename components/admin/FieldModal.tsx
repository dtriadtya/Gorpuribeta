'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Swal from 'sweetalert2'

interface Field {
  id?: number
  name: string
  description?: string
  pricePerHour: string | number
  imageUrl?: string
  facilities: string[]
  isActive?: boolean
}

interface FieldModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (fieldData: Field) => void
  field?: Field | null
  isEdit?: boolean
}

const FACILITY_OPTIONS = [
  'Parkir Gratis',
  'WiFi',
  'Locker',
  'Toilet',
  'Kantin',
  'AC',
  'Sound System',
  'Lighting',
  'Security',
  'Dressing Room'
]

export default function FieldModal({
  isOpen,
  onClose,
  onSave,
  field,
  isEdit = false
}: FieldModalProps) {
  const [formData, setFormData] = useState<Field>({
    name: '',
    description: '',
    pricePerHour: '',
    imageUrl: '',
    facilities: [],
    isActive: true
  })
  const [isUploading, setIsUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      if (isEdit && field) {
        setFormData({
          id: field.id,
          name: field.name || '',
          description: field.description || '',
          pricePerHour: field.pricePerHour?.toString() || '',
          imageUrl: field.imageUrl || '',
          facilities: field.facilities || [],
          isActive: field.isActive !== undefined ? field.isActive : true
        })
      } else {
        setFormData({
          name: '',
          description: '',
          pricePerHour: '',
          imageUrl: '',
          facilities: [],
          isActive: true
        })
      }
      setErrors({})
    }
  }, [isOpen, isEdit, field])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, pricePerHour: value === '' ? '' : value }))
    if (errors.pricePerHour) setErrors(prev => ({ ...prev, pricePerHour: '' }))
  }

  const handleFacilityToggle = (facility: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // reset input supaya bisa pilih file yang sama lagi
    e.target.value = ''

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, imageUrl: 'File harus berupa gambar' }))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, imageUrl: 'Ukuran file maksimal 5MB' }))
      return
    }

    setIsUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      if (isEdit && field?.id) {
        formDataUpload.append('fieldId', field.id.toString())
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      const response = await fetch('/api/v1/fields/upload-image', {
        method: 'POST',
        body: formDataUpload,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const result = await response.json()
      console.log('Upload result:', result)

      if (response.ok && (result.imageUrl || result.url)) {
        const uploadedUrl = result.imageUrl || result.url
        setFormData(prev => ({ ...prev, imageUrl: uploadedUrl }))
        setErrors(prev => ({ ...prev, imageUrl: '' }))
        Swal.fire({
          icon: 'success',
          title: 'Upload berhasil!',
          text: 'Gambar lapangan berhasil diunggah.',
          timer: 1500,
          showConfirmButton: false
        })
      } else {
        const errorMsg = result.error || 'Upload gagal - format respons tidak sesuai'
        setErrors(prev => ({ ...prev, imageUrl: errorMsg }))
        Swal.fire({
          icon: 'error',
          title: 'Upload Gagal',
          text: errorMsg
        })
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      if (error?.name === 'AbortError') {
        setErrors(prev => ({ ...prev, imageUrl: 'Upload timeout - coba lagi' }))
        Swal.fire({
          icon: 'warning',
          title: 'Timeout',
          text: 'Upload melebihi batas waktu, silakan coba lagi.'
        })
      } else {
        setErrors(prev => ({ ...prev, imageUrl: 'Terjadi kesalahan saat upload' }))
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Terjadi kesalahan saat upload gambar.'
        })
      }
    } finally {
      setIsUploading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Nama lapangan harus diisi'
    if (formData.pricePerHour === '' || parseFloat(formData.pricePerHour.toString()) <= 0)
      newErrors.pricePerHour = 'Harga per jam harus lebih dari 0'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSave({
        ...formData,
        pricePerHour: parseFloat(formData.pricePerHour.toString())
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Lapangan' : 'Tambah Lapangan Baru'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nama Lapangan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Lapangan *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Masukkan nama lapangan"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Deskripsi lapangan (opsional)"
            />
          </div>

          {/* Harga per Jam */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Harga per Jam (Rp) *
            </label>
            <input
              type="number"
              name="pricePerHour"
              value={formData.pricePerHour}
              onChange={handlePriceChange}
              min="0"
              step="1000"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.pricePerHour ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Masukkan harga per jam"
            />
            {errors.pricePerHour && (
              <p className="text-red-500 text-sm mt-1">{errors.pricePerHour}</p>
            )}
          </div>

          {/* Upload Gambar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Lapangan</label>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {isUploading && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Mengupload gambar...</span>
                </div>
              )}
              {formData.imageUrl && (
                <div className="relative">
                  <img
                    src={
                      formData.imageUrl.startsWith('http')
                        ? formData.imageUrl
                        : `/${formData.imageUrl.replace(/^\/+/, '')}`
                    }
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    ✓ Terupload
                  </div>
                </div>
              )}
              {errors.imageUrl && <p className="text-red-500 text-sm">{errors.imageUrl}</p>}
            </div>
          </div>

          {/* Fasilitas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Fasilitas</label>
            <div className="grid grid-cols-2 gap-2">
              {FACILITY_OPTIONS.map(facility => (
                <label key={facility} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.facilities.includes(facility)}
                    onChange={() => handleFacilityToggle(facility)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{facility}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isActive"
                    checked={formData.isActive === true}
                    onChange={() => setFormData(prev => ({ ...prev, isActive: true }))}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Aktif</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isActive"
                    checked={formData.isActive === false}
                    onChange={() => setFormData(prev => ({ ...prev, isActive: false }))}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">Tidak Aktif</span>
                </label>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {isUploading ? 'Menyimpan...' : isEdit ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
