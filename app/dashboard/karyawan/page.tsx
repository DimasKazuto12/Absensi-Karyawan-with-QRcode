'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Attendance {
  id: number
  checkIn: string
  checkOut: string | null
  date: string
}

export default function KaryawanDashboard() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [todayStatus, setTodayStatus] = useState({
    hasCheckedIn: false,
    hasCheckedOut: false,
    checkInTime: null as string | null
  })

  // Mengambil data karyawan
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId')
    const name = localStorage.getItem('userName')
    
    if (!storedUserId) {
      router.push('/')
      return
    }
    
    setUserId(storedUserId)
    setUserName(name || 'Karyawan')
    fetchAttendances(storedUserId)
    fetchTodayStatus(storedUserId)
  }, [])

  //Mengambil data absen berdasarkan id
  const fetchAttendances = async (id: string) => {
    try {
      const res = await fetch(`/api/attendance?userId=${id}`)
      const data = await res.json()
      setAttendances(data)
    } catch (error) {
      console.error('Gagal fetch absensi:', error)
    } finally {
      setLoading(false)
    }
  }

  // Untuk mengambil kondisi data karyawan hari ini
  const fetchTodayStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/attendance/today?userId=${id}`)
      const data = await res.json()
      setTodayStatus({
        hasCheckedIn: data.hasCheckedIn,
        hasCheckedOut: data.hasCheckedOut,
        checkInTime: data.checkInTime
      })
    } catch (error) {
      console.error('Gagal cek status:', error)
    }
  }

  // Mengambil data absensi untuk mengecek user yang sudah CheckIn
  const handleCheckin = async () => {
    if (!userId) return
    setActionLoading(true)
    
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: parseInt(userId) })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        alert(`✅ ${data.message}`)
        await fetchAttendances(userId)
        await fetchTodayStatus(userId)
      } else {
        alert(`❌ ${data.error}`)
      }
    } catch (error) {
      alert('❌ Gagal check in')
    } finally {
      setActionLoading(false)
    }
  }

  // Mengambil data absensi untuk mengecek user yang sudah CheckOut
  const handleCheckout = async () => {
    if (!userId) return
    setActionLoading(true)
    
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: parseInt(userId) })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        alert(`✅ ${data.message}`)
        await fetchAttendances(userId)
        await fetchTodayStatus(userId)
      } else {
        alert(`❌ ${data.error}`)
      }
    } catch (error) {
      alert('❌ Gagal check out')
    } finally {
      setActionLoading(false)
    }
  }

  // Proses logout
  const handleLogout = () => {
    localStorage.clear()
    router.push('/')
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-black">Dashboard Karyawan</h1>
            <p className="text-gray-600">Selamat datang, {userName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6 text-black">
        <h3 className="font-semibold mb-3">Absen Hari Ini</h3>
        <p className="text-sm text-gray-500 mb-3">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        
        {!todayStatus.hasCheckedIn ? (
          <button
            onClick={handleCheckin}
            disabled={actionLoading}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            {actionLoading ? 'Memproses...' : '✅ Check In'}
          </button>
        ) : !todayStatus.hasCheckedOut ? (
          <div>
            <p className="text-green-600 text-sm mb-2">
              ✓ Sudah Check In pukul {todayStatus.checkInTime && new Date(todayStatus.checkInTime).toLocaleTimeString('id-ID')}
            </p>
            <button
              onClick={handleCheckout}
              disabled={actionLoading}
              className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 disabled:bg-gray-400"
            >
              {actionLoading ? 'Memproses...' : '🏠 Check Out'}
            </button>
          </div>
        ) : (
          <p className="text-gray-500">✅ Sudah absen lengkap hari ini</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden text-black">
        <h2 className="text-xl font-bold p-6 pb-0">Riwayat Absensi</h2>
        
        {attendances.length === 0 ? (
          <p className="text-gray-500 p-6">Belum ada riwayat absensi</p>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50 text-black">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jam Masuk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jam Pulang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendances.map((att) => {
                const isToday = new Date(att.date).toDateString() === new Date().toDateString()
                return (
                  <tr key={att.id} className={isToday ? 'bg-blue-50' : ''}>
                    <td className="px-6 py-4">
                      {new Date(att.date).toLocaleDateString('id-ID')}
                      {isToday && <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded">Hari Ini</span>}
                    </td>
                    <td className="px-6 py-4">{new Date(att.checkIn).toLocaleTimeString('id-ID')}</td>
                    <td className="px-6 py-4">
                      {att.checkOut ? new Date(att.checkOut).toLocaleTimeString('id-ID') : 'Belum checkout'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}