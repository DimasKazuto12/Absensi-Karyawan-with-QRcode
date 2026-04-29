'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Sistem Absensi Karyawan
        </h2>
        <p className="text-gray-600 text-lg">
          Absensi mudah dengan QR Code untuk karyawan
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-5xl mb-4">👨‍💼</div>
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Login Admin</h3>
          <p className="text-gray-600 mb-6">
            Kelola data karyawan perusahaan
          </p>
          <button
            onClick={() => router.push('/login?role=admin')}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Login Admin
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-5xl mb-4">📱</div>
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Absen Karyawan</h3>
          <p className="text-gray-600 mb-6">
            Scan QR Code untuk melakukan absensi masuk/pulang
          </p>
          <button
            onClick={() => router.push('/login?role=karyawan')}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
          >
            Scan QR Absen
          </button>
        </div>
      </div>
    </div>
  )
}