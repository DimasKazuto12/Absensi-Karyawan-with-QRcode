import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function main() {
  // Buat admin
  await prisma.user.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Admin Utama',
      usia: 30,
      lamaBekerja: 5,
      qrCodeId: 'admin_' + Date.now(),
      role: 'ADMIN',
      deskripsi: 'Administrator utama'
    }
  })

  // Buat 15 karyawan contoh
  const karyawans = [
    { name: 'Budi Santoso', usia: 25, lamaBekerja: 2 },
    { name: 'Siti Aminah', usia: 28, lamaBekerja: 3 },
    { name: 'Agus Wijaya', usia: 22, lamaBekerja: 1 },
    { name: 'Dewi Kartika', usia: 30, lamaBekerja: 5 },
    { name: 'Eko Prasetyo', usia: 35, lamaBekerja: 8 },
    { name: 'Fitri Handayani', usia: 27, lamaBekerja: 4 },
    { name: 'Gunawan Setiawan', usia: 29, lamaBekerja: 4 },
    { name: 'Hesti Puspita', usia: 26, lamaBekerja: 2 },
    { name: 'Irfan Maulana', usia: 31, lamaBekerja: 6 },
    { name: 'Joko Susilo', usia: 24, lamaBekerja: 1 },
    { name: 'Kurnia Dewi', usia: 28, lamaBekerja: 3 },
    { name: 'Lukman Hakim', usia: 33, lamaBekerja: 7 },
    { name: 'Maya Sari', usia: 26, lamaBekerja: 2 },
    { name: 'Nugroho Wibowo', usia: 29, lamaBekerja: 4 },
    { name: 'Oktavia Lestari', usia: 32, lamaBekerja: 6 }
  ]

  for (let i = 0; i < karyawans.length; i++) {
    const k = karyawans[i]
    await prisma.user.upsert({
      where: { id: i + 2 },
      update: {},
      create: {
        name: k.name,
        usia: k.usia,
        lamaBekerja: k.lamaBekerja,
        qrCodeId: `karyawan_${Date.now()}_${i}`,
        role: 'KARYAWAN',
        deskripsi: `Karyawan bagian ${i % 2 === 0 ? 'Produksi' : 'Logistik'}`
      }
    })
  }

  console.log('✅ Seed data berhasil!')
}

main()
  .catch(e => {
    console.error('❌ Seed gagal:', e)
    process.exit(1)
  })
  .finally(async () => await prisma.$disconnect())