'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'
import AdminHeader from '@/components/admin/Header'
import FieldModal from '@/components/admin/FieldModal'
import Swal from 'sweetalert2'
import {
  Edit,
  Trash2,
  Image as ImageIcon
} from 'lucide-react'

/* ========== INTERFACES ========== */
interface User {
  id: number
  name: string
  email: string
  role: 'USER' | 'ADMIN'
}

interface Field {
  id: number
  name: string
  description?: string
  pricePerHour: number
  imageUrl?: string
  facilities: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    reservasi?: number
  }
}

interface Pagination {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

/* ========== KOMPONEN UTAMA ========== */
export default function FieldManagement() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [fields, setFields] = useState<Field[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [currentPage, setCurrentPage] = useState(1)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedField, setSelectedField] = useState<Field | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  /* ---------- dropdown state & ref ---------- */
  const [openDropdown, setOpenDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  /* ---------- auth & data ---------- */
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      window.location.replace('/login')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== 'ADMIN') {
        window.location.replace('/')
        return
      }
      setUser(parsedUser)
    } catch (error) {
      console.error('Error parsing user data:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.replace('/login')
    }
  }, [])

  useEffect(() => {
    fetchFields()
  }, [currentPage, searchTerm, statusFilter])

  /* ---------- klik di luar dropdown ---------- */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /* ---------- API ---------- */
  const fetchFields = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {}
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        status: statusFilter
      })
      const response = await fetch(`/api/admin/fields?${params.toString()}`, { headers })
      if (response.ok) {
        const data = await response.json()
        setFields(data.fields)
        setPagination(data.pagination)
      } else if (response.status === 401) {
        console.log('❌ Unauthorized - redirecting to login')
        router.push('/login')
      } else {
        console.error('Failed to fetch fields')
      }
    } catch (error) {
      console.error('Error fetching fields:', error)
    } finally {
      setIsLoading(false)
    }
  }

  /* ---------- handler filter & tambah ---------- */
  const handleStatusFilter = (status: 'ALL' | 'ACTIVE' | 'INACTIVE') => {
    setStatusFilter(status)
    setCurrentPage(1)
    setOpenDropdown(false)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  /* ---------- CRUD ---------- */
  const handleDeleteField = async (fieldId: number) => {
    try {
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {}
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`/api/admin/fields/${fieldId}`, {
        method: 'DELETE',
        headers
      })

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Lapangan berhasil dihapus',
          confirmButtonColor: '#2563eb'
        })
        fetchFields()
      } else {
        const errorData = await response.json()
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menghapus',
          text: errorData.error || 'Terjadi kesalahan',
          confirmButtonColor: '#2563eb'
        })
      }
    } catch (error) {
      console.error('Error deleting field:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Terjadi kesalahan saat menghapus lapangan',
        confirmButtonColor: '#2563eb'
      })
    } finally {
      setDeleteConfirm(null)
    }
  }

  const handleSaveField = async (fieldData: any) => {
    try {
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const url = showCreateModal ? '/api/admin/fields' : `/api/admin/fields/${selectedField?.id}`
      const method = showCreateModal ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(fieldData)
      })

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: showCreateModal ? 'Lapangan berhasil ditambahkan' : 'Lapangan berhasil diperbarui',
          confirmButtonColor: '#2563eb'
        })
        fetchFields()
        setShowCreateModal(false)
        setShowEditModal(false)
        setSelectedField(null)
      } else {
        const errorData = await response.json()
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menyimpan',
          text: errorData.error || 'Terjadi kesalahan',
          confirmButtonColor: '#2563eb'
        })
      }
    } catch (error) {
      console.error('Error saving field:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Terjadi kesalahan saat menyimpan lapangan',
        confirmButtonColor: '#2563eb'
      })
    }
  }

  /* ---------- utilitas ---------- */
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
  }

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Aktif' : 'Tidak Aktif'
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="lg:ml-64">
        <AdminHeader
          title="Manajemen Lapangan"
          onMenuClick={() => setSidebarOpen(true)}
        />
        <div className="p-4 lg:p-6">
          {/* ---------- CARD TABEL LAPANGAN ---------- */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            {/* Header Card */}
            <div className="flex items-center justify-between pl-4 pr-4 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center">
                <div className="p-2 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path fillRule="evenodd" d="M2 2.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5V3a.5.5 0 0 0-.5-.5zM3 3H2v1h1z" />
                    <path d="M5 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M5.5 7a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1zm0 4a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1z" />
                    <path fillRule="evenodd" d="M1.5 7a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5zM2 7h1v1H2zm0 3.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm1 .5H2v1h1z" />
                  </svg>
                </div>
                <h2 className="ml-3 text-lg font-semibold text-gray-800">List Lapangan</h2>
              </div>

              {/* Dropdown pindah ke kanan header */}
                <div className="relative inline-block text-left z-[40]" ref={dropdownRef}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setTimeout(() => setOpenDropdown((o) => !o), 50)
                    }}
                    className="flex items-center justify-between w-48 px-4 h-10 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                  >
                    <span className="text-sm text-gray-700 font-medium flex items-center">
                      {statusFilter === 'ALL'
                        ? 'Semua Lapangan'
                        : statusFilter === 'ACTIVE'
                        ? 'Aktif'
                        : 'Tidak Aktif'}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                        openDropdown ? 'rotate-180' : ''
                      }`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {openDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] origin-top-right animate-fadeIn">
                      <div className="py-1">
                        <button onClick={() => handleStatusFilter('ALL')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                          Semua
                        </button>
                        <button onClick={() => handleStatusFilter('ACTIVE')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                          Aktif
                        </button>
                        <button onClick={() => handleStatusFilter('INACTIVE')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                          Tidak Aktif
                        </button>
                        <hr className="my-1 border-gray-200" />
                        <button
                          onClick={() => {
                            setShowCreateModal(true)
                            setOpenDropdown(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-primary-600 hover:bg-gray-100"
                        >
                          Tambah Lapangan
                        </button>
                      </div>
                    </div>
                  )}
                </div>

            </div>

            {/* Tabel Lapangan */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lapangan
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Harga
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reservasi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dibuat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600" />
                          <span className="ml-2 text-gray-600">Memuat data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : fields.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        Tidak ada data lapangan
                      </td>
                    </tr>
                  ) : (
                    fields.map((field) => (
                      <tr key={field.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              {field.imageUrl ? (
                                <img
                                  className="h-12 w-12 rounded-lg object-cover"
                                  src={field.imageUrl}
                                  alt={field.name}
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <ImageIcon className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{field.name}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {field.description || 'Tidak ada deskripsi'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPrice(field.pricePerHour)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {field._count?.reservasi || 0} reservasi
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(field.isActive)}`}
                          >
                            {getStatusText(field.isActive)}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(field.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedField(field)
                                setShowEditModal(true)
                              }}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(field.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={!pagination.hasPrev}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                    disabled={!pagination.hasNext}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Menampilkan{' '}
                      <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                      {' '}sampai{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.totalCount)}
                      </span>
                      {' '}dari{' '}
                      <span className="font-medium">{pagination.totalCount}</span>
                      {' '}hasil
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={!pagination.hasPrev}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pagination.page
                              ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                        disabled={!pagination.hasNext}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------- MODAL HAPUS & LAPANGAN ---------- */}
      {/* Create Modal */}
      <FieldModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleSaveField}
        isEdit={false}
      />

      {/* Edit Modal */}
      <FieldModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedField(null)
        }}
        onSave={handleSaveField}
        field={selectedField}
        isEdit={true}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Hapus Lapangan
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Apakah Anda yakin ingin menghapus lapangan ini? Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleDeleteField(deleteConfirm)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}