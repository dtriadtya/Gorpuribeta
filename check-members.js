const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkMembers() {
  try {
    const members = await prisma.member.findMany({
      include: {
        field: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    console.log('=== ALL MEMBERS IN DATABASE ===\n')
    
    if (members.length === 0) {
      console.log('❌ No members found in database!')
    } else {
      members.forEach(m => {
        console.log(`ID: ${m.id}`)
        console.log(`Name: ${m.name}`)
        console.log(`Field: ${m.field.name} (ID: ${m.fieldId})`)
        console.log(`Day: ${m.dayOfWeek}`)
        console.log(`Time: ${m.startTime} - ${m.endTime}`)
        console.log(`Active: ${m.isActive}`)
        console.log(`Contact: ${m.contactName} (${m.contactPhone})`)
        console.log('---')
      })
    }

    await prisma.$disconnect()
  } catch (error) {
    console.error('Error:', error)
    await prisma.$disconnect()
  }
}

checkMembers()
