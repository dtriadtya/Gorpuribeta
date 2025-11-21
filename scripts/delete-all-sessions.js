const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function deleteAllSessions() {
  try {
    const result = await prisma.session.deleteMany()
    console.log(`✅ Berhasil menghapus ${result.count} session dari tabel Session`)
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteAllSessions()
