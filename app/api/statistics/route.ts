import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Ambil semua karyawan
    const employees = await prisma.user.findMany({
      where: { role: 'KARYAWAN' }
    })

    // Hitung kehadiran hari ini
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const kehadiranHariIni = await prisma.attendance.findMany({
      where: {
        date: { gte: today }
      }
    })

    // Hitung status bekerja 
    const sedangBekerja = kehadiranHariIni.filter(att => !att.checkOut).length
    const selesai = kehadiranHariIni.filter(att => att.checkOut).length
    
    // Hitung statistik
    const totalKaryawan = employees.length
    const totalKehadiranHariIni = kehadiranHariIni.length
    
    // Rata-rata usia
    const totalUsia = employees.reduce((sum, emp) => sum + emp.usia, 0)
    const rataRataUsia = totalKaryawan > 0 ? Math.round(totalUsia / totalKaryawan) : 0
    
    // Rata-rata lama bekerja
    const totalLamaBekerja = employees.reduce((sum, emp) => sum + emp.lamaBekerja, 0)
    const rataRataLamaBekerja = totalKaryawan > 0 ? Math.round(totalLamaBekerja / totalKaryawan) : 0
    
    // Persentase kehadiran
    const persentaseKehadiran = totalKaryawan > 0 
      ? Math.round((totalKehadiranHariIni / totalKaryawan) * 100) 
      : 0

    return NextResponse.json({
      success: true,
      statistics: {
        totalKaryawan,
        totalKehadiranHariIni,
        totalSedangBekerja: sedangBekerja,
        totalSelesai: selesai,
        rataRataUsia,
        rataRataLamaBekerja,
        persentaseKehadiran
      }
    })
    
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil statistik' },
      { status: 500 }
    )
  }
}