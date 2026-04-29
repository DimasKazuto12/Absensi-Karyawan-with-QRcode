import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { name, usia, lamaBekerja } = await req.json()
    
    if (!name || !usia || !lamaBekerja) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      )
    }
    
    const qrCodeId = `qr_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    const user = await prisma.user.create({
      data: {
        name,
        usia,
        lamaBekerja,
        qrCodeId,
        role: 'KARYAWAN'
      }
    })
    
    return NextResponse.json({
      message: 'Registrasi berhasil',
      user: {
        id: user.id,
        name: user.name,
        qrCodeId: user.qrCodeId
      }
    }, { status: 201 })
    
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}