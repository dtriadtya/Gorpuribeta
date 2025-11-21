'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'
import AdminHeader from '@/components/admin/Header'
import {
  Edit,
  Trash2,
  Mail,
  Phone,
  Shield,
  Calendar
} from 'lucide-react'
import UserModal from '@/components/admin/UserModal'
import Swal from 'sweetalert2'

interface User {
  id: number
  name: string
  email: string
  phone?: string
  role: 'USER' | 'ADMIN'
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: { reservations: number }
}
interface Pagination {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function UserManagement() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'USER' | 'ADMIN' | ''>('')
  const [currentPage, setCurrentPage] = useState(1)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const [openDropdown, setOpenDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
    fetchUsers()
  }, [currentPage, searchTerm, roleFilter])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {}
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sort: 'name',
        order: 'asc',
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && { role: roleFilter })
      })

      const response = await fetch(`/api/admin/users?${params}`, { headers })
      if (response.ok) {
        const data = await response.json()
        const sortedUsers: User[] = (data.users || []).sort((a: User, b: User) =>
          a.name.localeCompare(b.name, 'id', { sensitivity: 'base' })
        )
        setUsers(sortedUsers)
        setPagination(data.pagination)
      } else if (response.status === 401) {
        console.log('❌ Unauthorized - redirecting to login')
        router.push('/login')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleFilter = (role: '' | 'USER' | 'ADMIN') => {
    setRoleFilter(role)
    setCurrentPage(1)
    setOpenDropdown(false)
  }

  const handleDeleteUser = async (userId: number) => {
    try {
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {}
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE', headers })
      if (response.ok) {
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'User berhasil dihapus', confirmButtonColor: '#2563eb' })
        fetchUsers()
      } else {
        const errorData = await response.json()
        Swal.fire({ icon: 'error', title: 'Gagal Menghapus', text: errorData.error || 'Terjadi kesalahan', confirmButtonColor: '#2563eb' })
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      Swal.fire({ icon: 'error', title: 'Error', text: 'Terjadi kesalahan saat menghapus user', confirmButtonColor: '#2563eb' })
    } finally {
      setDeleteConfirm(null)
    }
  }

  const handleSaveUser = async (userData: any) => {
    try {
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const url = showCreateModal ? '/api/admin/users' : `/api/admin/users/${selectedUser?.id}`
      const method = showCreateModal ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(userData)
      })

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: showCreateModal ? 'User berhasil ditambahkan' : 'User berhasil diperbarui',
          confirmButtonColor: '#2563eb'
        })
        fetchUsers()
        setShowCreateModal(false)
        setShowEditModal(false)
        setSelectedUser(null)
      } else {
        const errorData = await response.json()
        Swal.fire({ icon: 'error', title: 'Gagal Menyimpan', text: errorData.error || 'Terjadi kesalahan', confirmButtonColor: '#2563eb' })
      }
    } catch (error) {
      console.error('Error saving user:', error)
      Swal.fire({ icon: 'error', title: 'Error', text: 'Terjadi kesalahan saat menyimpan user', confirmButtonColor: '#2563eb' })
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'USER': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  const getRoleText = (role: string) => (role === 'ADMIN' ? 'Admin' : 'User')
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

  if (isLoading && !user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    )
  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="lg:ml-64">
        <AdminHeader title="Manajemen Pengguna" onMenuClick={() => setSidebarOpen(true)} />

        <div className="p-4 lg:p-6">
          {/* Card Tabel Pengguna */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header Card */}
            <div className="flex items-center justify-between pl-4 pr-6 py-4 border-b border-gray-200 bg-white relative">
              <div className="flex items-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    className="text-primary-600"
                  >
                    <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zm4.5 0a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zM8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6m5 2.755C12.146 12.825 10.623 12 8 12s-4.146.826-5 1.755V14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1z"/>
                  </svg>
                <h2 className="ml-3 text-lg font-semibold text-gray-800">List Pengguna</h2>
              </div>

              {/* Dropdown dipindahkan ke sini */}
            <div className="relative z-[40]" ref={dropdownRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setTimeout(() => setOpenDropdown((o) => !o), 50)
                }}
                className="flex items-center justify-between w-48 px-4 h-10 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              >
                <span className="text-sm text-gray-700 font-medium">
                  {roleFilter === 'ADMIN'
                    ? 'Admin'
                    : roleFilter === 'USER'
                    ? 'User'
                    : 'Semua Pengguna'}
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
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-[50] origin-top-right animate-fadeIn">
                      <div className="py-1">
                        <button
                          onClick={() => handleRoleFilter('USER')}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          User
                        </button>
                        <button
                          onClick={() => handleRoleFilter('ADMIN')}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          Admin
                        </button>
                        <button
                          onClick={() => handleRoleFilter('')}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          Semua
                        </button>
                        <hr className="my-1 border-gray-200" />
                        <button
                          onClick={() => {
                            setShowCreateModal(true)
                            setOpenDropdown(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-primary-600 hover:bg-gray-100"
                        >
                          Tambah User
                        </button>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Tabel */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pengguna</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reservasi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bergabung</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600" />
                          <span className="ml-2 text-gray-600">Memuat data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        Tidak ada data pengguna
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">ID: {user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <Phone className="w-4 h-4 mr-2 text-gray-400" />
                              {user.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                              user.role
                            )}`}
                          >
                            {getRoleText(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user._count.reservations} booking
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user)
                                setShowEditModal(true)
                              }}
                              className="text-blue-600 hover:text-blue-900 p-1"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(user.id)}
                              className="text-red-600 hover:text-red-900 p-1"
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
          </div>
        </div>
      </div>

      {/* Modal Delete */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Hapus Pengguna</h3>
                <p className="text-sm text-gray-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus pengguna ini? Data yang terkait akan dihapus secara permanen.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirm)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      <UserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleSaveUser}
        mode="create"
      />
      <UserModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedUser(null)
        }}
        onSave={handleSaveUser}
        user={selectedUser}
        mode="edit"
      />
    </div>
  )
}
