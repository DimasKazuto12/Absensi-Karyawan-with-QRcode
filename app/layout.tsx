import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Aplikasi Absen Karyawan',
  description: 'Sistem absensi dengan QR Code',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-100">
          <nav className="bg-white shadow-md p-4">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-xl font-bold text-blue-600"><Link href="/"> Absen Karyawan</Link></h1>
              <div className="space-x-4">
                <a href="/login" className="text-gray-600 hover:text-blue-600">Login</a>
              </div>
            </div>
          </nav>
          {children}
        </div>
      </body>
    </html>
  )
}