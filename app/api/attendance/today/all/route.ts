import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// mengambil semua data karyawan
export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const attendances = await prisma.attendance.findMany({
      where: {
        date: { gte: today }
      },
      include: {
        user: true
      }
    })
    
    return NextResponse.json(attendances)
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
  }
}