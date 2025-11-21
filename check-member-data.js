const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkMembers() {
  try {
    const members = await prisma.member.findMany({
      where: {
        fieldId: 5
      }
    })
    
    console.log('=== MEMBER DATA FOR FIELD 5 ===')
    members.forEach(m => {
      console.log(`\nID: ${m.id}`)
      console.log(`Name: ${m.name}`)
      console.log(`Day: ${m.dayOfWeek}`)
      console.log(`Time: ${m.startTime} - ${m.endTime}`)
      console.log(`Package Type: ${m.packageType}`)
      console.log(`Start Date: ${m.startDate}`)
      console.log(`End Date: ${m.endDate}`)
      console.log(`Active: ${m.isActive}`)
      console.log('---')
    })
    
    await prisma.$disconnect()
  } catch (error) {
    console.error('Error:', error)
    await prisma.$disconnect()
  }
}

checkMembers()
