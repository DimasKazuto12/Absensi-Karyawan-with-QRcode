import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// mengecek data user hari ini
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'userId diperlukan' }, { status: 400 })
    }
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayAttendance = await prisma.attendance.findFirst({
      where: {
        userId: parseInt(userId),
        date: { gte: today }
      }
    })
    
    return NextResponse.json({
      hasCheckedIn: !!todayAttendance,
      hasCheckedOut: !!todayAttendance?.checkOut,
      attendanceId: todayAttendance?.id || null,
      checkInTime: todayAttendance?.checkIn || null
    })
    
  } catch (error) {
    console.error('Error cek status:', error)
    return NextResponse.json({ error: 'Gagal cek status' }, { status: 500 })
  }
}