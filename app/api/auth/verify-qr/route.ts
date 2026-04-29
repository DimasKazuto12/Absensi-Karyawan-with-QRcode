import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { qrCodeId } = await req.json()
    
    console.log('Received QR Code ID:', qrCodeId)
    
    if (!qrCodeId) {
      return NextResponse.json(
        { error: 'QR Code ID diperlukan' },
        { status: 400 }
      )
    }
    
    // Cari user berdasarkan qrCodeId
    const user = await prisma.user.findUnique({
      where: { qrCodeId: qrCodeId }
    })
    
    console.log('User found:', user)
    
    if (!user) {
      return NextResponse.json(
        { error: 'QR Code tidak valid. Silakan registrasi ulang.' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Verifikasi berhasil',
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        qrCodeId: user.qrCodeId
      }
    })
    
  } catch (error) {
    console.error('Error verify QR:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}