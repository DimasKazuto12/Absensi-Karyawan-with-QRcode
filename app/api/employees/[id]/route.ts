import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Ambil detail karyawan
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const employee = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    })
    
    if (!employee) {
      return NextResponse.json({ error: 'Karyawan tidak ditemukan' }, { status: 404 })
    }
    
    return NextResponse.json(employee)
  } catch (error) {
    console.error('Error GET employee:', error)
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
  }
}

// Update karyawan
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { name, usia, lamaBekerja } = await req.json()
    
    const employee = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { 
        name, 
        usia: parseInt(usia), 
        lamaBekerja: parseInt(lamaBekerja),
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Data berhasil diupdate',
      employee
    })
  } catch (error) {
    console.error('Error PUT employee:', error)
    return NextResponse.json({ error: 'Gagal update data' }, { status: 500 })
  }
}

// Hapus Karyawan
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await prisma.attendance.deleteMany({
      where: { userId: parseInt(id) }
    })
    
    await prisma.user.delete({
      where: { id: parseInt(id) }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Karyawan berhasil dihapus'
    })
  } catch (error) {
    console.error('Error DELETE employee:', error)
    return NextResponse.json({ error: 'Gagal hapus data' }, { status: 500 })
  }
}