'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get('role')
  const [qrData, setQrData] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info')
  const [lastScannedId, setLastScannedId] = useState<string | null>(null)

  const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
    const result = detectedCodes[0]?.rawValue || null
    
    if (result === lastScannedId) {
      return
    }
    
    if (result && !loading) {
      setLastScannedId(result)
      setLoading(true)
      setQrData(result)
      
      try {
        const res = await fetch('/api/auth/verify-qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qrCodeId: result })
        })
        
        const data = await res.json()
        
        // Mengecek apakah data nya sesuai atau tidak
        if (res.ok) {

          localStorage.setItem('userId', data.user.id.toString())
          localStorage.setItem('userRole', data.user.role)
          localStorage.setItem('userName', data.user.name)
          
          const absenRes = await fetch('/api/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: data.user.id })
          })
          
          const absenData = await absenRes.json()
          
          let pesan = ''
          if (absenData.message?.includes('Checkout')) {
            pesan = `🏠 Checkout berhasil! Sampai jumpa ${data.user.name}`
          } else if (absenData.message?.includes('Checkin')) {
            pesan = `✅ Checkin berhasil! Selamat bekerja ${data.user.name}`
          } else {
            pesan = `📋 ${absenData.message}`
          }
          
          setMessageType('success')
          setMessage(pesan)
          
          setTimeout(() => {
            setMessage('')
            setMessageType('info')
          }, 3000)
          
        } else {
          setMessageType('error')
          setMessage(`❌ ${data.error}`)
          setTimeout(() => {
            setMessage('')
          }, 3000)
        }
      } catch (error) {
        setMessageType('error')
        setMessage('❌ Gagal memverifikasi QR Code')
        setTimeout(() => {
          setMessage('')
        }, 3000)
      } finally {
        setLoading(false)
        setTimeout(() => {
          setLastScannedId(null)
        }, 3000)
      }
    }
  }

  // Ketika scanner nya ada masalah
  const handleError = (err: unknown) => {
    console.log('Scanner error:', err)
    setMessageType('error')
    setMessage('❌ Error kamera. Pastikan kamera diizinkan.')
    setTimeout(() => {
      setMessage('')
    }, 3000)
  }

  // Mengecek apakah yang login itu karyawan atau admin
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    if (name === 'admin' || name === 'Admin Utama') {
      localStorage.setItem('userId', '1')
      localStorage.setItem('userRole', 'ADMIN')
      localStorage.setItem('userName', 'Admin Utama')
      router.push('/dashboard/admin')
    } else {
      setMessageType('error')
      setMessage('❌ Username admin salah')
      setTimeout(() => setMessage(''), 3000)
    }
    setLoading(false)
  }

  // Notifikasi sesuai kondisi
  const getMessageClass = () => {
    if (messageType === 'success') return 'bg-green-100 text-green-700 border-l-4 border-green-500'
    if (messageType === 'error') return 'bg-red-100 text-red-700 border-l-4 border-red-500'
    return 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
  }

  if (role === 'karyawan') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">Scan QR Code Absen</h2>
          
          {/* Notifikasi yang lebih menarik */}
          {message && (
            <div className={`mb-4 p-4 rounded-lg ${getMessageClass()} shadow-sm transition-all duration-300`}>
              <div className="flex items-center gap-3">
                {messageType === 'success' && <span className="text-2xl">✅</span>}
                {messageType === 'error' && <span className="text-2xl">❌</span>}
                {messageType === 'info' && <span className="text-2xl">ℹ️</span>}
                <span className="font-medium">{message}</span>
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <Scanner
              onScan={handleScan}
              onError={handleError}
              formats={['qr_code']}
            />
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">
              Arahkan kamera ke QR Code karyawan
            </p>
            {loading && (
              <p className="text-xs text-blue-500 mt-2 animate-pulse">
                ⏳ Memproses...
              </p>
            )}
          </div>

          {/* Tombol ke dashboard (opsional) */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/dashboard/karyawan')}
              className="text-blue-500 hover:text-blue-700 text-sm underline"
            >
              Lihat Riwayat Absensi
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">Login Admin</h2>
        
        {message && (
          <div className={`mb-4 p-3 rounded text-center ${getMessageClass()}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleAdminLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Username Admin</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
              placeholder="Masukkan 'admin'"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : 'Login Admin'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <a href="/register" className="text-blue-500 hover:underline">
            Registrasi Karyawan Baru
          </a>
        </div>
      </div>
    </div>
  )
}