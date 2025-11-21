'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'
import AdminHeader from '@/components/admin/Header'
import { Plus, Edit2, Trash2, Clock, Calendar, Info, SquarePen, RefreshCw } from 'lucide-react'
import Swal from 'sweetalert2'

interface Member {
  id: number
  name: string
  contactName: string
  fieldId: number
  dayOfWeek: string
  startTime: string
  endTime: string
  packageType: string
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
  field: {
    id: number
    name: string
  }
}

interface Field {
  id: number
  name: string
}

const dayOfWeekMap: Record<string, string> = {
  MONDAY: 'Senin',
  TUESDAY: 'Selasa',
  WEDNESDAY: 'Rabu',
  THURSDAY: 'Kamis',
  FRIDAY: 'Jumat',
  SATURDAY: 'Sabtu',
  SUNDAY: 'Minggu'
}

const START_HOUR = 8
const END_HOUR = 22

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [showExtendModal, setShowExtendModal] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [addingScheduleForMember, setAddingScheduleForMember] = useState<Member | null>(null)
  const [extendingMember, setExtendingMember] = useState<{
    name: string
    contactName: string
    fieldId: number
    field: { id: number; name: string }
    packageType: string
    startDate: string
    endDate: string
    schedules: Array<{ id: number }>
  } | null>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    fieldId: '',
    packageType: 'MEMBER_1',
    startDate: new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD
  })

  const [selectedSchedules, setSelectedSchedules] = useState<Array<{
    dayOfWeek: string
    startTime: string
    endTime: string
  }>>([{
    dayOfWeek: '',
    startTime: '',
    endTime: ''
  }])

  const [scheduleFormData, setScheduleFormData] = useState({
    dayOfWeek: '',
    startTime: '',
    endTime: ''
  })

  const [extendFormData, setExtendFormData] = useState({
    packageType: 'MEMBER_1'
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      window.location.replace('/login')
      return
    }

    try {
      const user = JSON.parse(userData)
      if (user.role !== 'ADMIN') {
        window.location.replace('/dashboard')
        return
      }

      fetchMembers()
      fetchFields()
    } catch (error) {
      console.error('Error parsing user data:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.replace('/login')
    }
  }, [])

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch('/api/admin/members', { headers })
      
      if (res.status === 401) {
        console.log('❌ Unauthorized - redirecting to login')
        window.location.replace('/login')
        return
      }
      
      if (res.ok) {
        const data = await res.json()
        setMembers(data.members || [])
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFields = async () => {
    try {
      const res = await fetch('/api/v1/fields')
      if (res.ok) {
        const data = await res.json()
        setFields(data.fields || [])
      }
    } catch (error) {
      console.error('Error fetching fields:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Debug: log semua formData
    console.log('FormData:', formData)
    console.log('Selected Schedules:', selectedSchedules)

    // Validasi dengan info spesifik
    const missingFields = []
    if (!formData.name) missingFields.push('Member Name')
    if (!formData.contactName) missingFields.push('Contact Person')
    if (!formData.fieldId) missingFields.push('Field')
    
    // Validasi jadwal hanya untuk mode add (bukan edit)
    if (!editingMember) {
      // Validasi setiap schedule
      const hasEmptySchedule = selectedSchedules.some(schedule => 
        !schedule.dayOfWeek || !schedule.startTime || !schedule.endTime
      )
      
      if (hasEmptySchedule) {
        missingFields.push('Complete all schedule fields (Day, Start Time, End Time)')
      }
    }

    if (missingFields.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Tidak Lengkap',
        html: `Field yang belum diisi:<br/><strong>${missingFields.join('<br/>')}</strong>`,
        confirmButtonColor: '#2563eb'
      })
      return
    }

    const url = editingMember
      ? `/api/admin/members/${editingMember.id}`
      : '/api/admin/members'

    const method = editingMember ? 'PUT' : 'POST'

    // Payload berbeda untuk edit vs add
    const payload = editingMember 
      ? {
          name: formData.name,
          contactName: formData.contactName,
          fieldId: parseInt(formData.fieldId),
          packageType: formData.packageType,
          startDate: formData.startDate
        }
      : {
          name: formData.name,
          contactName: formData.contactName,
          fieldId: parseInt(formData.fieldId),
          schedules: selectedSchedules,
          packageType: formData.packageType,
          startDate: formData.startDate
        }

    console.log('Sending payload:', payload)

    try {
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: editingMember ? 'Member Diperbarui!' : 'Member Ditambahkan!',
          showConfirmButton: false,
          timer: 1500
        })
        setShowModal(false)
        resetForm()
        fetchMembers()
      } else if (res.status === 409) {
        // Conflict - schedule overlap
        Swal.fire({
          icon: 'error',
          title: 'Jadwal Bentrok!',
          html: data.message || data.error || 'Jadwal bentrok dengan member lain',
          confirmButtonColor: '#dc2626'
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: data.error || 'Terjadi kesalahan'
        })
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal menyimpan member'
      })
    }
  }

  const handleEdit = (member: Member) => {
    setEditingMember(member)
    setFormData({
      name: member.name,
      contactName: member.contactName,
      fieldId: member.fieldId.toString(),
      packageType: member.packageType || 'MEMBER_1',
      startDate: member.startDate ? new Date(member.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    })
    setSelectedSchedules([{
      dayOfWeek: '',
      startTime: '',
      endTime: ''
    }])
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Hapus Member?',
      text: 'Tindakan ini tidak dapat dibatalkan',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal'
    })

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token')
        const headers: HeadersInit = {}
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        const res = await fetch(`/api/admin/members/${id}`, {
          method: 'DELETE',
          headers
        })

        if (res.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Terhapus!',
            showConfirmButton: false,
            timer: 1500
          })
          fetchMembers()
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: 'Gagal menghapus member'
        })
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      contactName: '',
      fieldId: '',
      packageType: 'MEMBER_1',
      startDate: new Date().toISOString().split('T')[0]
    })
    setSelectedSchedules([{
      dayOfWeek: '',
      startTime: '',
      endTime: ''
    }])
    setEditingMember(null)
  }

  const resetScheduleForm = () => {
    setScheduleFormData({
      dayOfWeek: '',
      startTime: '',
      endTime: ''
    })
    setAddingScheduleForMember(null)
  }

  const handleExtendMember = (memberGroup: any) => {
    setExtendingMember(memberGroup)
    // Default to 1 month extension
    setExtendFormData({
      packageType: 'MEMBER_1'
    })
    setShowExtendModal(true)
  }

  const handleSubmitExtend = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!extendingMember) return

    try {
      // Calculate new end date based on current end date + selected package duration
      const currentEndDate = new Date(extendingMember.endDate)
      const months = extendFormData.packageType === 'MEMBER_PLUS' ? 12 :
                    parseInt(extendFormData.packageType.split('_')[1])
      
      const newEndDate = new Date(currentEndDate)
      newEndDate.setMonth(newEndDate.getMonth() + months)

      // Update all schedules for this member
      // IMPORTANT: DO NOT change startDate, only update packageType and endDate
      const token = localStorage.getItem('token')
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const updatePromises = extendingMember.schedules.map(schedule => 
        fetch(`/api/admin/members/${schedule.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            name: extendingMember.name,
            contactName: extendingMember.contactName,
            fieldId: extendingMember.fieldId,
            packageType: extendFormData.packageType,
            // startDate is intentionally NOT included - keep original start date
            endDate: newEndDate.toISOString().split('T')[0] // Only update end date
          })
        })
      )

      const results = await Promise.all(updatePromises)
      const allSuccess = results.every(res => res.ok)

      if (allSuccess) {
        Swal.fire({
          icon: 'success',
          title: 'Member Diperpanjang!',
          html: `Member <strong>${extendingMember.name}</strong> berhasil diperpanjang<br/>
                 <small>Berakhir pada: ${newEndDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</small>`,
          showConfirmButton: false,
          timer: 2000
        })
        setShowExtendModal(false)
        setExtendingMember(null)
        fetchMembers()
      } else {
        throw new Error('Some updates failed')
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal memperpanjang member'
      })
    }
  }

  const handleAddSchedule = (member: Member) => {
    setAddingScheduleForMember(member)
    setScheduleFormData({
      dayOfWeek: '',
      startTime: '',
      endTime: ''
    })
    setShowAddScheduleModal(true)
  }

  const handleSubmitSchedule = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!addingScheduleForMember) return

    const missingFields = []
    if (!scheduleFormData.dayOfWeek) missingFields.push('Day')
    if (!scheduleFormData.startTime) missingFields.push('Start Time')
    if (!scheduleFormData.endTime) missingFields.push('End Time')

    if (missingFields.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Tidak Lengkap',
        html: `Field yang hilang:<br/><strong>${missingFields.join('<br/>')}</strong>`,
        confirmButtonColor: '#2563eb'
      })
      return
    }

    const payload = {
      name: addingScheduleForMember.name,
      contactName: addingScheduleForMember.contactName,
      fieldId: addingScheduleForMember.fieldId,
      dayOfWeek: scheduleFormData.dayOfWeek,
      startTime: scheduleFormData.startTime,
      endTime: scheduleFormData.endTime,
      packageType: addingScheduleForMember.packageType || 'MONTHLY_1',
      startDate: addingScheduleForMember.startDate ? new Date(addingScheduleForMember.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    }

    try {
      const token = localStorage.getItem('token')
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Jadwal Ditambahkan!',
          text: `Jadwal baru untuk ${addingScheduleForMember.name} telah dibuat`,
          showConfirmButton: false,
          timer: 1500
        })
        setShowAddScheduleModal(false)
        resetScheduleForm()
        fetchMembers()
      } else if (res.status === 409) {
        // Conflict - schedule overlap
        Swal.fire({
          icon: 'error',
          title: 'Jadwal Bentrok!',
          html: data.message || data.error || 'Jadwal bentrok dengan member lain di lapangan yang sama',
          confirmButtonColor: '#dc2626'
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: data.error || 'Terjadi kesalahan'
        })
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal menambahkan jadwal'
      })
    }
  }

  // Calendar helpers
  const formatDate = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dd}`
  }

  const getDayOfWeek = (d: Date): string => {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
    return days[d.getDay()]
  }

  // Filter members - show all by default
  const filteredMembers = members

  // Group members by name and contact info (same member might have multiple schedules)
  const groupedMembers = filteredMembers.reduce((acc, member) => {
    const key = `${member.name}-${member.contactName}-${member.fieldId}`
    if (!acc[key]) {
      acc[key] = {
        name: member.name,
        contactName: member.contactName,
        fieldId: member.fieldId,
        field: member.field,
        isActive: member.isActive,
        packageType: member.packageType,
        startDate: member.startDate,
        endDate: member.endDate,
        schedules: []
      }
    }
    acc[key].schedules.push({
      id: member.id,
      dayOfWeek: member.dayOfWeek,
      startTime: member.startTime,
      endTime: member.endTime,
      createdAt: member.createdAt
    })
    return acc
  }, {} as Record<string, {
    name: string
    contactName: string
    fieldId: number
    field: { id: number; name: string }
    isActive: boolean
    packageType?: string
    startDate?: string
    endDate?: string
    schedules: Array<{
      id: number
      dayOfWeek: string
      startTime: string
      endTime: string
      createdAt: string
    }>
  }>)

  const groupedMembersList = Object.values(groupedMembers)

  const weekdays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="lg:ml-64">
        <AdminHeader title="Member Reguler" onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="p-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900">List Member</h3>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowInfoModal(true)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Info className="w-4 h-4" />
                    <span className="text-sm">Lihat Info Jadwal</span>
                  </button>
                  <button
                    onClick={() => {
                      resetForm()
                      setShowModal(true)
                    }}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Tambah Member</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '20%'}}>
                      Nama Member
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '15%'}}>
                      Lapangan
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '15%'}}>
                      Paket
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '20%'}}>
                      Periode
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '15%'}}>
                      Kontak
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '15%'}}>
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {groupedMembersList.map((memberGroup, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{memberGroup.name}</div>
                            {memberGroup.schedules.length > 1 && (
                              <div className="text-xs text-gray-500">{memberGroup.schedules.length} jadwal</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">{memberGroup.field.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          memberGroup.packageType === 'MEMBER_PLUS' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {memberGroup.packageType === 'MEMBER_PLUS' ? 'Member+' : 'Member Reguler'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-xs text-gray-900">
                          {memberGroup.startDate && (
                            <div>
                              {new Date(memberGroup.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          )}
                          {memberGroup.endDate && (
                            <div className="text-red-600">
                              {new Date(memberGroup.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">{memberGroup.contactName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleExtendMember(memberGroup)}
                            className="text-green-600 hover:text-green-900"
                            title="Perpanjang member"
                          >
                            <RefreshCw className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleAddSchedule({
                              id: memberGroup.schedules[0].id,
                              name: memberGroup.name,
                              contactName: memberGroup.contactName,
                              fieldId: memberGroup.fieldId,
                              dayOfWeek: memberGroup.schedules[0].dayOfWeek,
                              startTime: memberGroup.schedules[0].startTime,
                              endTime: memberGroup.schedules[0].endTime,
                              isActive: memberGroup.isActive,
                              createdAt: memberGroup.schedules[0].createdAt,
                              field: memberGroup.field,
                              packageType: memberGroup.packageType || 'MONTHLY_1',
                              startDate: memberGroup.startDate || new Date().toISOString(),
                              endDate: memberGroup.endDate || new Date().toISOString()
                            })}
                            className="text-purple-600 hover:text-purple-900"
                            title="Tambah jadwal"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEdit({
                              id: memberGroup.schedules[0].id,
                              name: memberGroup.name,
                              contactName: memberGroup.contactName,
                              fieldId: memberGroup.fieldId,
                              dayOfWeek: memberGroup.schedules[0].dayOfWeek,
                              startTime: memberGroup.schedules[0].startTime,
                              endTime: memberGroup.schedules[0].endTime,
                              isActive: memberGroup.isActive,
                              createdAt: memberGroup.schedules[0].createdAt,
                              field: memberGroup.field,
                              packageType: memberGroup.packageType || 'MONTHLY_1',
                              startDate: memberGroup.startDate || new Date().toISOString(),
                              endDate: memberGroup.endDate || new Date().toISOString()
                            })}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit member"
                          >
                            <SquarePen className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              const confirmDelete = async () => {
                                const result = await Swal.fire({
                                  title: 'Hapus Member?',
                                  html: `Apakah Anda yakin ingin menghapus <strong>${memberGroup.name}</strong>?<br/>Ini akan menghapus semua ${memberGroup.schedules.length} jadwal.`,
                                  icon: 'warning',
                                  showCancelButton: true,
                                  confirmButtonColor: '#dc2626',
                                  cancelButtonColor: '#6b7280',
                                  confirmButtonText: 'Hapus',
                                  cancelButtonText: 'Batal'
                                })

                                if (result.isConfirmed) {
                                  try {
                                    const token = localStorage.getItem('token')
                                    const headers: HeadersInit = {}
                                    
                                    if (token) {
                                      headers['Authorization'] = `Bearer ${token}`
                                    }

                                    for (const schedule of memberGroup.schedules) {
                                      await fetch(`/api/admin/members/${schedule.id}`, {
                                        method: 'DELETE',
                                        headers
                                      })
                                    }
                                    
                                    Swal.fire({
                                      icon: 'success',
                                      title: 'Terhapus!',
                                      text: 'Member dan semua jadwal telah dihapus',
                                      showConfirmButton: false,
                                      timer: 1500
                                    })
                                    fetchMembers()
                                  } catch (error) {
                                    Swal.fire({
                                      icon: 'error',
                                      title: 'Gagal',
                                      text: 'Gagal menghapus member'
                                    })
                                  }
                                }
                              }
                              confirmDelete()
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Hapus member"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {groupedMembersList.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Belum ada member. Klik "Add Member" untuk menambah member baru
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingMember ? 'Edit Member' : 'Tambah Member Baru'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Member *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Contoh: Badminton Club XYZ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Kontak *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lapangan *
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        const dropdown = document.getElementById('field-dropdown')
                        dropdown?.classList.toggle('hidden')
                      }}
                      className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                    >
                      <span className="text-sm text-gray-700">
                        {formData.fieldId ? fields.find(f => f.id.toString() === formData.fieldId)?.name : 'Pilih lapangan'}
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5 text-gray-400"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div id="field-dropdown" className="hidden absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {fields.map((field) => (
                        <button
                          key={field.id}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, fieldId: field.id.toString() })
                            document.getElementById('field-dropdown')?.classList.add('hidden')
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                        >
                          {field.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih Tipe Paket *
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        const dropdown = document.getElementById('package-type-dropdown')
                        dropdown?.classList.toggle('hidden')
                      }}
                      className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                    >
                      <span className="text-sm text-gray-700">
                        {formData.packageType === 'MEMBER_1' ? 'Member - 1 Bulan' :
                         formData.packageType === 'MEMBER_2' ? 'Member - 2 Bulan' :
                         formData.packageType === 'MEMBER_3' ? 'Member - 3 Bulan' :
                         formData.packageType === 'MEMBER_4' ? 'Member - 4 Bulan' :
                         formData.packageType === 'MEMBER_5' ? 'Member - 5 Bulan' :
                         formData.packageType === 'MEMBER_6' ? 'Member - 6 Bulan' :
                         formData.packageType === 'MEMBER_PLUS' ? 'Member+ - 12 Bulan' : 'Pilih tipe paket'}
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5 text-gray-400"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div id="package-type-dropdown" className="hidden absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                      <div className="p-3 border-b border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 uppercase">Member</p>
                      </div>
                      {[
                        { value: 'MEMBER_1', label: '1 Bulan' },
                        { value: 'MEMBER_2', label: '2 Bulan' },
                        { value: 'MEMBER_3', label: '3 Bulan' },
                        { value: 'MEMBER_4', label: '4 Bulan' },
                        { value: 'MEMBER_5', label: '5 Bulan' },
                        { value: 'MEMBER_6', label: '6 Bulan' }
                      ].map((pkg) => (
                        <button
                          key={pkg.value}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, packageType: pkg.value })
                            document.getElementById('package-type-dropdown')?.classList.add('hidden')
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                        >
                          {pkg.label}
                        </button>
                      ))}
                      <div className="p-3 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 uppercase">Member+</p>
                      </div>
                      <button
                        key="MEMBER_PLUS"
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, packageType: 'MEMBER_PLUS' })
                          document.getElementById('package-type-dropdown')?.classList.add('hidden')
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 font-medium text-blue-700"
                      >
                        12 Bulan
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Mulai Member *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Pilih tanggal kapan member mulai aktif
                  </p>
                </div>

                {/* Field jadwal hanya tampil saat mode Add, tidak saat Edit */}
                {!editingMember && (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Jadwal Bermain *
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSchedules([...selectedSchedules, {
                              dayOfWeek: '',
                              startTime: '',
                              endTime: ''
                            }])
                          }}
                          className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Tambah Hari
                        </button>
                      </div>

                      {selectedSchedules.map((schedule, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-700">Jadwal {index + 1}</h4>
                            {selectedSchedules.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newSchedules = selectedSchedules.filter((_, i) => i !== index)
                                  setSelectedSchedules(newSchedules)
                                }}
                                className="text-red-600 hover:text-red-700"
                                title="Hapus jadwal ini"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="space-y-3">
                            {/* Pilih Hari */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Hari *
                              </label>
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const dropdown = document.getElementById(`day-dropdown-${index}`)
                                    dropdown?.classList.toggle('hidden')
                                  }}
                                  className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                                >
                                  <span className="text-sm text-gray-700">
                                    {schedule.dayOfWeek ? dayOfWeekMap[schedule.dayOfWeek] : 'Pilih hari'}
                                  </span>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-5 h-5 text-gray-400"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                                <div id={`day-dropdown-${index}`} className="hidden absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                                  {[
                                    { value: 'MONDAY', label: 'Senin' },
                                    { value: 'TUESDAY', label: 'Selasa' },
                                    { value: 'WEDNESDAY', label: 'Rabu' },
                                    { value: 'THURSDAY', label: 'Kamis' },
                                    { value: 'FRIDAY', label: 'Jumat' },
                                    { value: 'SATURDAY', label: 'Sabtu' },
                                    { value: 'SUNDAY', label: 'Minggu' }
                                  ].map((day) => (
                                    <button
                                      key={day.value}
                                      type="button"
                                      onClick={() => {
                                        const newSchedules = [...selectedSchedules]
                                        newSchedules[index].dayOfWeek = day.value
                                        setSelectedSchedules(newSchedules)
                                        document.getElementById(`day-dropdown-${index}`)?.classList.add('hidden')
                                      }}
                                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                                    >
                                      {day.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Jam Mulai & Selesai */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Jam Mulai *
                                </label>
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const dropdown = document.getElementById(`start-time-dropdown-${index}`)
                                      dropdown?.classList.toggle('hidden')
                                    }}
                                    className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                                  >
                                    <span className="text-sm text-gray-700">
                                      {schedule.startTime || 'Pilih jam'}
                                    </span>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={2}
                                      stroke="currentColor"
                                      className="w-5 h-5 text-gray-400"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                  <div id={`start-time-dropdown-${index}`} className="hidden absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                                    {Array.from({ length: 14 }, (_, i) => {
                                      const hour = i + 8
                                      const time = `${hour.toString().padStart(2, '0')}:00`
                                      return (
                                        <button
                                          key={time}
                                          type="button"
                                          onClick={() => {
                                            const newSchedules = [...selectedSchedules]
                                            newSchedules[index].startTime = time
                                            setSelectedSchedules(newSchedules)
                                            document.getElementById(`start-time-dropdown-${index}`)?.classList.add('hidden')
                                          }}
                                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                                        >
                                          {time}
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Jam Selesai *
                                </label>
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const dropdown = document.getElementById(`end-time-dropdown-${index}`)
                                      dropdown?.classList.toggle('hidden')
                                    }}
                                    className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                                  >
                                    <span className="text-sm text-gray-700">
                                      {schedule.endTime || 'Pilih jam'}
                                    </span>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={2}
                                      stroke="currentColor"
                                      className="w-5 h-5 text-gray-400"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                  <div id={`end-time-dropdown-${index}`} className="hidden absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                                    {Array.from({ length: 14 }, (_, i) => {
                                      const hour = i + 9
                                      const time = `${hour.toString().padStart(2, '0')}:00`
                                      return (
                                        <button
                                          key={time}
                                          type="button"
                                          onClick={() => {
                                            const newSchedules = [...selectedSchedules]
                                            newSchedules[index].endTime = time
                                            setSelectedSchedules(newSchedules)
                                            document.getElementById(`end-time-dropdown-${index}`)?.classList.add('hidden')
                                          }}
                                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                                        >
                                          {time}
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Info durasi */}
                            {schedule.dayOfWeek && schedule.startTime && schedule.endTime && (
                              <div className="bg-blue-50 p-2 rounded border border-blue-200">
                                <p className="text-xs text-blue-800">
                                  <strong>{dayOfWeekMap[schedule.dayOfWeek]}</strong> {schedule.startTime} - {schedule.endTime}
                                  {` (${parseInt(schedule.endTime.split(':')[0]) - parseInt(schedule.startTime.split(':')[0])} jam)`}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    {editingMember ? 'Perbarui' : 'Buat'} Member
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Schedule Modal */}
      {showAddScheduleModal && addingScheduleForMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">Tambah Jadwal</h2>
              <p className="text-sm text-gray-600 mb-4">
                Menambah jadwal baru untuk <strong className="text-gray-900">{addingScheduleForMember.name}</strong>
              </p>

              {/* Existing Schedules */}
              <div className="mb-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-sm font-semibold text-blue-900 mb-3">Jadwal Saat Ini:</h3>
                <div className="space-y-2">
                  {(() => {
                    const member = groupedMembersList.find(m => m.name === addingScheduleForMember.name)
                    return member?.schedules.map((schedule) => (
                      <div key={schedule.id} className="flex items-center justify-between bg-white rounded p-2 text-sm">
                        <div className="flex-1">
                          <span className="font-medium text-gray-700">{dayOfWeekMap[schedule.dayOfWeek]}</span>
                          <span className="text-gray-600 text-xs ml-2">{schedule.startTime} - {schedule.endTime}</span>
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            const result = await Swal.fire({
                              title: 'Hapus Jadwal?',
                              html: `Apakah Anda yakin ingin menghapus jadwal <strong>${dayOfWeekMap[schedule.dayOfWeek]} ${schedule.startTime}-${schedule.endTime}</strong>?`,
                              icon: 'warning',
                              showCancelButton: true,
                              confirmButtonColor: '#dc2626',
                              cancelButtonColor: '#6b7280',
                              confirmButtonText: 'Hapus',
                              cancelButtonText: 'Batal'
                            })

                            if (result.isConfirmed) {
                              try {
                                const token = localStorage.getItem('token')
                                const headers: HeadersInit = {}
                                
                                if (token) {
                                  headers['Authorization'] = `Bearer ${token}`
                                }

                                const res = await fetch(`/api/admin/members/${schedule.id}`, {
                                  method: 'DELETE',
                                  headers
                                })

                                if (res.ok) {
                                  Swal.fire({
                                    icon: 'success',
                                    title: 'Terhapus!',
                                    showConfirmButton: false,
                                    timer: 1500
                                  })
                                  fetchMembers()
                                  
                                  // Close modal jika tidak ada jadwal lagi
                                  const updatedMember = groupedMembersList.find(m => m.name === addingScheduleForMember.name)
                                  if (updatedMember && updatedMember.schedules.length <= 1) {
                                    setShowAddScheduleModal(false)
                                    resetScheduleForm()
                                  }
                                }
                              } catch (error) {
                                Swal.fire({
                                  icon: 'error',
                                  title: 'Gagal',
                                  text: 'Gagal menghapus jadwal'
                                })
                              }
                            }
                          }}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded p-1 transition-colors"
                          title="Hapus jadwal ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  })()}
                </div>
              </div>
              
              <form onSubmit={handleSubmitSchedule} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih Hari Tambahan *
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        const dropdown = document.getElementById('schedule-day-dropdown')
                        dropdown?.classList.toggle('hidden')
                      }}
                      className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    >
                      <span className="text-sm text-gray-700">
                        {scheduleFormData.dayOfWeek ? dayOfWeekMap[scheduleFormData.dayOfWeek] : 'Pilih hari'}
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5 text-gray-400"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div id="schedule-day-dropdown" className="hidden absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                      {[
                        { value: 'MONDAY', label: 'Senin' },
                        { value: 'TUESDAY', label: 'Selasa' },
                        { value: 'WEDNESDAY', label: 'Rabu' },
                        { value: 'THURSDAY', label: 'Kamis' },
                        { value: 'FRIDAY', label: 'Jumat' },
                        { value: 'SATURDAY', label: 'Sabtu' },
                        { value: 'SUNDAY', label: 'Minggu' }
                      ].map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => {
                            setScheduleFormData({ ...scheduleFormData, dayOfWeek: day.value })
                            document.getElementById('schedule-day-dropdown')?.classList.add('hidden')
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jam Mulai *
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          const dropdown = document.getElementById('schedule-start-time-dropdown')
                          dropdown?.classList.toggle('hidden')
                        }}
                        className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                      >
                        <span className="text-sm text-gray-700">
                          {scheduleFormData.startTime || 'Pilih jam'}
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-5 h-5 text-gray-400"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div id="schedule-start-time-dropdown" className="hidden absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                        {Array.from({ length: 14 }, (_, i) => {
                          const hour = i + 8
                          const time = `${hour.toString().padStart(2, '0')}:00`
                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => {
                                setScheduleFormData({ ...scheduleFormData, startTime: time })
                                document.getElementById('schedule-start-time-dropdown')?.classList.add('hidden')
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                            >
                              {time}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jam Selesai *
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          const dropdown = document.getElementById('schedule-end-time-dropdown')
                          dropdown?.classList.toggle('hidden')
                        }}
                        className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                      >
                        <span className="text-sm text-gray-700">
                          {scheduleFormData.endTime || 'Pilih jam'}
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-5 h-5 text-gray-400"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div id="schedule-end-time-dropdown" className="hidden absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                        {Array.from({ length: 14 }, (_, i) => {
                          const hour = i + 9
                          const time = `${hour.toString().padStart(2, '0')}:00`
                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => {
                                setScheduleFormData({ ...scheduleFormData, endTime: time })
                                document.getElementById('schedule-end-time-dropdown')?.classList.add('hidden')
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                            >
                              {time}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {scheduleFormData.startTime && scheduleFormData.endTime && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <p className="text-sm text-blue-800">
                        <strong>Durasi:</strong> {
                          parseInt(scheduleFormData.endTime.split(':')[0]) - 
                          parseInt(scheduleFormData.startTime.split(':')[0])
                        } jam
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium"
                  >
                    Tambah Jadwal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddScheduleModal(false)
                      resetScheduleForm()
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 font-medium"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Info Modal - Schedule Overview */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Ringkasan Jadwal Member</h2>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Group by Field */}
              {fields.map(field => {
                const fieldMembers = groupedMembersList.filter(m => m.fieldId === field.id)
                if (fieldMembers.length === 0) return null

                return (
                  <div key={field.id} className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-gray-200">
                      {field.name}
                    </h3>
                    
                    {/* Group by Day */}
                    {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => {
                      const daySchedules = fieldMembers.flatMap(member => 
                        member.schedules.filter(s => s.dayOfWeek === day)
                      )
                      
                      if (daySchedules.length === 0) return null

                      return (
                        <div key={day} className="mb-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <h4 className="font-semibold text-gray-700 mb-2">
                              {dayOfWeekMap[day]}
                            </h4>
                            <div className="space-y-2">
                              {daySchedules.map(schedule => {
                                const member = fieldMembers.find(m => 
                                  m.schedules.some(s => s.id === schedule.id)
                                )
                                return (
                                  <div key={schedule.id} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900">{member?.name}</p>
                                      <p className="text-xs text-gray-500">Kontak: {member?.contactName}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-medium text-blue-600">
                                        {schedule.startTime} - {schedule.endTime}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {parseInt(schedule.endTime.split(':')[0]) - parseInt(schedule.startTime.split(':')[0])} jam
                                      </p>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}

              {groupedMembersList.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada member terdaftar</p>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Extend Member Modal */}
      {showExtendModal && extendingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-6 h-6 text-green-600" />
                  <h2 className="text-2xl font-bold">Perpanjang Member</h2>
                </div>
                <button
                  onClick={() => {
                    setShowExtendModal(false)
                    setExtendingMember(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Member Info */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                <h3 className="text-sm font-semibold text-blue-900 mb-3">Informasi Member:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nama:</span>
                    <span className="font-medium text-gray-900">{extendingMember.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kontak:</span>
                    <span className="font-medium text-gray-900">{extendingMember.contactName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lapangan:</span>
                    <span className="font-medium text-gray-900">{extendingMember.field.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paket Saat Ini:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      extendingMember.packageType === 'MEMBER_PLUS' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {extendingMember.packageType === 'MEMBER_1' ? 'Member 1 Bln' :
                       extendingMember.packageType === 'MEMBER_2' ? 'Member 2 Bln' :
                       extendingMember.packageType === 'MEMBER_3' ? 'Member 3 Bln' :
                       extendingMember.packageType === 'MEMBER_4' ? 'Member 4 Bln' :
                       extendingMember.packageType === 'MEMBER_5' ? 'Member 5 Bln' :
                       extendingMember.packageType === 'MEMBER_6' ? 'Member 6 Bln' :
                       extendingMember.packageType === 'MEMBER_PLUS' ? 'Member+ 12 Bln' : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-300">
                    <span className="text-gray-600">Mulai:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(extendingMember.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Berakhir:</span>
                    <span className="font-medium text-red-600">
                      {new Date(extendingMember.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitExtend} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih Paket Perpanjangan *
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        const dropdown = document.getElementById('extend-package-dropdown')
                        dropdown?.classList.toggle('hidden')
                      }}
                      className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                    >
                      <span className="text-sm text-gray-700">
                        {extendFormData.packageType === 'MEMBER_1' ? 'Member - 1 Bulan' :
                         extendFormData.packageType === 'MEMBER_2' ? 'Member - 2 Bulan' :
                         extendFormData.packageType === 'MEMBER_3' ? 'Member - 3 Bulan' :
                         extendFormData.packageType === 'MEMBER_4' ? 'Member - 4 Bulan' :
                         extendFormData.packageType === 'MEMBER_5' ? 'Member - 5 Bulan' :
                         extendFormData.packageType === 'MEMBER_6' ? 'Member - 6 Bulan' :
                         extendFormData.packageType === 'MEMBER_PLUS' ? 'Member+ - 12 Bulan' : 'Pilih paket'}
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5 text-gray-400"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div id="extend-package-dropdown" className="hidden absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                      <div className="p-3 border-b border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 uppercase">Member</p>
                      </div>
                      {[
                        { value: 'MEMBER_1', label: '1 Bulan' },
                        { value: 'MEMBER_2', label: '2 Bulan' },
                        { value: 'MEMBER_3', label: '3 Bulan' },
                        { value: 'MEMBER_4', label: '4 Bulan' },
                        { value: 'MEMBER_5', label: '5 Bulan' },
                        { value: 'MEMBER_6', label: '6 Bulan' }
                      ].map((pkg) => (
                        <button
                          key={pkg.value}
                          type="button"
                          onClick={() => {
                            setExtendFormData({ ...extendFormData, packageType: pkg.value })
                            document.getElementById('extend-package-dropdown')?.classList.add('hidden')
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                        >
                          {pkg.label}
                        </button>
                      ))}
                      <div className="p-3 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 uppercase">Member+</p>
                      </div>
                      <button
                        key="MEMBER_PLUS"
                        type="button"
                        onClick={() => {
                          setExtendFormData({ ...extendFormData, packageType: 'MEMBER_PLUS' })
                          document.getElementById('extend-package-dropdown')?.classList.add('hidden')
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 font-medium text-blue-700"
                      >
                        12 Bulan
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                {extendFormData.packageType && extendingMember && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="text-sm font-semibold text-green-900 mb-2">📅 Preview Perpanjangan:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Durasi Tambahan:</span>
                        <span className="font-semibold text-green-800 bg-green-100 px-2 py-1 rounded">
                          +{(() => {
                            const months = extendFormData.packageType === 'MEMBER_PLUS' ? 12 :
                                          parseInt(extendFormData.packageType.split('_')[1])
                            return `${months} bulan`
                          })()}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-green-300">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Perpanjangan dari:</span>
                          <span className="font-medium text-gray-900">
                            {new Date(extendingMember.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Berakhir pada:</span>
                          <span className="font-bold text-green-700">
                            {(() => {
                              const currentEndDate = new Date(extendingMember.endDate)
                              const months = extendFormData.packageType === 'MEMBER_PLUS' ? 12 :
                                            parseInt(extendFormData.packageType.split('_')[1])
                              const newEndDate = new Date(currentEndDate)
                              newEndDate.setMonth(newEndDate.getMonth() + months)
                              return newEndDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                            })()}
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-green-300 bg-blue-50 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
                        <div className="flex items-center text-xs text-blue-700">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span>Tanggal mulai member tetap: {new Date(extendingMember.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium"
                  >
                    Perpanjang Member
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowExtendModal(false)
                      setExtendingMember(null)
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 font-medium"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
