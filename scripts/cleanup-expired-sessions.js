/**
 * Script untuk cleanup session yang sudah expired
 * Jalankan sebagai cron job setiap 1 jam
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function cleanupExpiredSessions() {
  try {
    console.log('🧹 Starting session cleanup...')
    
    const now = new Date()
    
    // Hapus session yang sudah expired dari table Session
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: { lt: now }
      }
    })
    
    console.log(`✅ Cleaned up ${result.count} expired session(s)`)
    console.log(`   Current time: ${now.toLocaleString('id-ID')}`)
    
  } catch (error) {
    console.error('❌ Error cleaning up sessions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupExpiredSessions()
