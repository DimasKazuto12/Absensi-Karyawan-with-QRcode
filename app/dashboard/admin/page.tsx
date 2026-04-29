'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Employee {
  id: number
  name: string
  usia: number
  lamaBekerja: number
  qrCodeId: string
  statusKerja?: 'bekerja' | 'selesai' | 'tidak_hadir'
  checkInTime?: string | null
}

interface Statistics {
  totalKaryawan: number
  totalKehadiranHariIni: number
  totalSedangBekerja: number
  totalSelesai: number
  rataRataUsia: number
  rataRataLamaBekerja: number
  persentaseKehadiran: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState<Statistics>({
    totalKaryawan: 0,
    totalKehadiranHariIni: 0,
    totalSedangBekerja: 0,
    totalSelesai: 0,
    rataRataUsia: 0,
    rataRataLamaBekerja: 0,
    persentaseKehadiran: 0
  })
  
  // Logika edit
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    usia: '',
    lamaBekerja: '',
  })

  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Jika yang login bukan AdminDashboard, maka akan terlempar ke home
  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (role !== 'ADMIN') {
      router.push('/')
    }
    fetchEmployees()
    fetchStatistics()
  }, [])

  // Notifikasi pesan
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  // Mengambil semua data karyawan hari ini
  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees')
      const data = await res.json()
      
      const todayRes = await fetch('/api/attendance/today/all')
      const todayData = await todayRes.json()
      const kehadiranMap = new Map()
      todayData.forEach((att: any) => {
        kehadiranMap.set(att.userId, {
          hasCheckedIn: true,
          hasCheckedOut: !!att.checkOut,
          checkInTime: att.checkIn
        })
      })
      
      let employeesData = data.success ? data.employees : data
      
      employeesData = employeesData.map((emp: Employee) => {
        const kehadiran = kehadiranMap.get(emp.id)
        if (!kehadiran) {
          return { ...emp, statusKerja: 'tidak_hadir', checkInTime: null }
        }
        if (kehadiran.hasCheckedOut) {
          return { ...emp, statusKerja: 'selesai', checkInTime: kehadiran.checkInTime }
        }
        return { ...emp, statusKerja: 'bekerja', checkInTime: kehadiran.checkInTime }
      })
      
      setEmployees(employeesData)
    } catch (error) {
      console.error('Gagal fetch:', error)
      showMessage('error', 'Gagal mengambil data karyawan')
    } finally {
      setLoading(false)
    }
  }

  // Mengambil data statistik
  const fetchStatistics = async () => {
    try {
      const res = await fetch('/api/statistics')
      const data = await res.json()
      if (data.success) {
        setStatistics(data.statistics)
      }
    } catch (error) {
      console.error('Gagal fetch statistik:', error)
    }
  }

  // Sistem edit karyawan
  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee)
    setEditForm({
      name: employee.name,
      usia: employee.usia.toString(),
      lamaBekerja: employee.lamaBekerja.toString(),
    })
    setIsEditing(true)
  }

  // Ketika mengirim updata/edit data karyawan
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEmployee) return
    
    try {
      const res = await fetch(`/api/employees/${editingEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          usia: parseInt(editForm.usia),
          lamaBekerja: parseInt(editForm.lamaBekerja),
        })
      })
      
      if (res.ok) {
        showMessage('success', `✅ Data ${editForm.name} berhasil diupdate`)
        fetchEmployees()
        fetchStatistics()
        setIsEditing(false)
        setEditingEmployee(null)
      } else {
        showMessage('error', 'Gagal update data')
      }
    } catch (error) {
      showMessage('error', 'Terjadi kesalahan')
    }
  }

  // Sistem hapus karyawan
  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Yakin hapus karyawan "${name}"?`)) {
      try {
        const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' })
        if (res.ok) {
          showMessage('success', `✅ Karyawan ${name} berhasil dihapus`)
          fetchEmployees()
          fetchStatistics()
        } else {
          showMessage('error', 'Gagal hapus karyawan')
        }
      } catch (error) {
        showMessage('error', 'Terjadi kesalahan')
      }
    }
  }

  // Status karyawan hari ini
  const getStatusBadge = (status?: 'bekerja' | 'selesai' | 'tidak_hadir') => {
    switch (status) {
      case 'bekerja':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">🟡 Bekerja</span>
      case 'selesai':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">✅ Selesai</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-500">⚪ Tidak Hadir</span>
    }
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      {message && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white animate-pulse`}>
          {message.text}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Dashboard Admin</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-4 text-white">
          <div className="text-3xl font-bold">{statistics.totalKaryawan}</div>
          <div className="text-sm opacity-90">Total Karyawan</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-4 text-white">
          <div className="text-3xl font-bold">{statistics.totalKehadiranHariIni}</div>
          <div className="text-sm opacity-90">Hadir Hari Ini</div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-4 text-white">
          <div className="text-3xl font-bold">{statistics.totalSedangBekerja}</div>
          <div className="text-sm opacity-90">Sedang Bekerja</div>
        </div>
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg shadow-lg p-4 text-white">
          <div className="text-3xl font-bold">{statistics.totalSelesai}</div>
          <div className="text-sm opacity-90">Selesai / Pulang</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-4 text-white">
          <div className="text-3xl font-bold">{statistics.persentaseKehadiran}%</div>
          <div className="text-sm opacity-90">Persentase Kehadiran</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-4 text-white">
          <div className="text-3xl font-bold">{statistics.rataRataUsia}</div>
          <div className="text-sm opacity-90">Rata-rata Usia</div>
        </div>
      </div>

      {isEditing && editingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-black">Edit Karyawan</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Nama</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full p-2 border rounded text-black"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Usia</label>
                <input
                  type="number"
                  value={editForm.usia}
                  onChange={(e) => setEditForm({...editForm, usia: e.target.value})}
                  className="w-full p-2 border rounded text-black"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Lama Bekerja (tahun)</label>
                <input
                  type="number"
                  value={editForm.lamaBekerja}
                  onChange={(e) => setEditForm({...editForm, lamaBekerja: e.target.value})}
                  className="w-full p-2 border rounded text-black"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded flex-1 hover:bg-blue-600">
                  Update
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold text-black">📋 Daftar Karyawan & Status Kerja</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Masa Kerja</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.map((emp) => (
                <tr key={emp.id} className={`hover:bg-gray-50 ${
                  emp.statusKerja === 'bekerja' ? 'bg-yellow-50' : 
                  emp.statusKerja === 'selesai' ? 'bg-green-50' : ''
                }`}>
                  <td className="px-6 py-4 text-black font-medium">{emp.name}</td>
                  <td className="px-6 py-4 text-black">{emp.usia} thn</td>
                  <td className="px-6 py-4 text-black">{emp.lamaBekerja} thn</td>
                  <td className="px-6 py-4">{getStatusBadge(emp.statusKerja)}</td>
                  <td className="px-6 py-4 text-black text-sm">
                    {emp.checkInTime ? new Date(emp.checkInTime).toLocaleTimeString('id-ID') : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEditModal(emp)}
                        className="text-blue-500 hover:text-blue-700 transition"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id, emp.name)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {employees.length === 0 && (
          <div className="text-center py-8 text-gray-500">Belum ada data karyawan</div>
        )}
      </div>
    </div>
  )
}