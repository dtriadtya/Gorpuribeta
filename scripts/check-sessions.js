const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkSessions() {
  const sessions = await prisma.session.findMany({
    include: {
      user: {
        select: { email: true }
      }
    }
  })
  
  console.log('=== SESSIONS IN DATABASE ===')
  console.log('Total sessions:', sessions.length)
  console.log('')
  
  sessions.forEach(s => {
    console.log(`User: ${s.user.email}`)
    console.log(`  Device: ${s.deviceInfo}`)
    console.log(`  IP: ${s.ipAddress}`)
    console.log(`  Created: ${new Date(s.createdAt).toLocaleString('id-ID')}`)
    console.log(`  Expires: ${new Date(s.expiresAt).toLocaleString('id-ID')}`)
    console.log('')
  })
  
  await prisma.$disconnect()
}

checkSessions()
