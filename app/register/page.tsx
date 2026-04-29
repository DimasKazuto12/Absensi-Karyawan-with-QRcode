'use client'

import { useState } from 'react'
import { generateQRCode } from '@/lib/utils'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    usia: '',
    lamaBekerja: ''
  })
  const [qrCode, setQrCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [karyawanId, setKaryawanId] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Mengambil data register di folder /api/auth/register
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          usia: parseInt(formData.usia),
          lamaBekerja: parseInt(formData.lamaBekerja)
        })
      })

      const data = await res.json()

      if (res.ok) {
        setKaryawanId(data.user.id)
        const qrDataUrl = await generateQRCode(data.user.qrCodeId)
        setQrCode(qrDataUrl)
        setMessage('✅ Registrasi berhasil! QR Code siap digunakan untuk absen.')
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Gagal registrasi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">Registrasi Karyawan Baru</h2>
        
        {message && (
          <div className={`mb-4 p-3 rounded text-center ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}
        
        {/* Ketika karyawan sudah register maka auto generate qr */}
        {qrCode ? (
          <div className="text-center">
            <div className="mb-4">
              <img src={qrCode} alt="QR Code" className="mx-auto w-64 h-64" />
            </div>
            <p className="text-gray-700 mb-4">
              <strong>Nama:</strong> {formData.name}<br />
              <strong>ID Karyawan:</strong> {karyawanId}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Simpan QR Code ini. Karyawan akan scan QR ini untuk absen.
            </p>
            <button
              onClick={() => window.print()}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Cetak QR Code
            </button>
          </div>
          
        ) : (

          // Ketika user belum register
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Nama Lengkap</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Usia</label>
              <input
                type="number"
                value={formData.usia}
                onChange={(e) => setFormData({...formData, usia: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Lama Bekerja (tahun)</label>
              <input
                type="number"
                value={formData.lamaBekerja}
                onChange={(e) => setFormData({...formData, lamaBekerja: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? 'Memproses...' : 'Registrasi & Generate QR'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}