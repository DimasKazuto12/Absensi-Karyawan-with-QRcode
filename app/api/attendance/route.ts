import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId,
        date: {
          gte: today
        }
      }
    })
    

    // Mengecek apakah karyawan itu sudah absen atau belum dan proses checkout nya
    if (existingAttendance) {
      if (!existingAttendance.checkOut) {
        const updated = await prisma.attendance.update({
          where: { id: existingAttendance.id },
          data: { checkOut: new Date() }
        })
        return NextResponse.json({
          message: 'Checkout berhasil',
          attendance: updated
        })
      } else {
        return NextResponse.json({
          message: 'Anda sudah absen hari ini'
        })
      }
    }
    
    // Absen masuk baru
    const attendance = await prisma.attendance.create({
      data: {
        userId,
        checkIn: new Date()
      }
    })
    
    return NextResponse.json({
      message: 'Checkin berhasil',
      attendance
    })
    
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Gagal absen' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    
    if (userId) {
      const attendances = await prisma.attendance.findMany({
        where: { userId: parseInt(userId) },
        orderBy: { date: 'desc' }
      })
      return NextResponse.json(attendances)
    }
    
    const allAttendances = await prisma.attendance.findMany({
      include: { user: true },
      orderBy: { date: 'desc' },
      take: 50
    })
    return NextResponse.json(allAttendances)
    
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
  }
}