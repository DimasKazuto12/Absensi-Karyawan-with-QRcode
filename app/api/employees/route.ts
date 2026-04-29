import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Ambil semua karyawan
export async function GET() {
  try {
    const employees = await prisma.user.findMany({
      where: { role: 'KARYAWAN' },
      orderBy: { createdAt: 'desc' },
      include: {
        attendances: {
          orderBy: { date: 'desc' },
          take: 5
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      employees: employees
    })
  } catch (error) {
    console.error('Error GET employees:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data karyawan' },
      { status: 500 }
    )
  }
}

// Logika seperti register untuk membuat karyawan baru
export async function POST(req: NextRequest) {
  try {
    const { name, usia, lamaBekerja} = await req.json()
    
    if (!name || !usia || lamaBekerja === undefined) {
      return NextResponse.json(
        { error: 'Nama, usia, dan lama bekerja wajib diisi' },
        { status: 400 }
      )
    }
    
    const qrCodeId = `QR_${Date.now()}_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    
    const employee = await prisma.user.create({
      data: {
        name: name.trim(),
        usia: parseInt(usia),
        lamaBekerja: parseInt(lamaBekerja),
        qrCodeId: qrCodeId,
        role: 'KARYAWAN'
      }
    })
    
    console.log(`✅ Karyawan baru ditambahkan oleh admin: ${employee.name}`)
    
    return NextResponse.json({
      success: true,
      message: 'Karyawan berhasil ditambahkan',
      employee
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error POST employee:', error)
    return NextResponse.json(
      { error: 'Gagal menambah karyawan' },
      { status: 500 }
    )
  }
}