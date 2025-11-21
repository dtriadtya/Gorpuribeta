const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function resetSessions() {
  try {
    const result = await prisma.user.updateMany({
      data: {
        sessionToken: null,
      },
    })

    console.log(`✅ Berhasil mereset ${result.count} session token`)
    console.log('📌 Semua user harus login ulang untuk mendapatkan session token baru')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetSessions()
