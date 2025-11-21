const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkReservations() {
  try {
    // Check today's date (13 Nov 2025)
    const today = new Date('2025-11-13');
    
    console.log('🔍 Checking reservations for Kamis, 13 November 2025...\n');
    
    const reservations = await prisma.reservation.findMany({
      where: {
        tanggal_reservasi: today,
        id_lapangan: 4 // Lapangan Badminton
      },
      select: {
        id_reservasi: true,
        jam_mulai_reservasi: true,
        jam_selesai_reservasi: true,
        status_reservasi: true,
        status_pembayaran: true,
        tipe_pembayaran: true,
        user: {
          select: {
            nama_user: true
          }
        }
      }
    });
    
    if (reservations.length === 0) {
      console.log('❌ No reservations found for this date');
    } else {
      console.log(`✅ Found ${reservations.length} reservation(s):\n`);
      reservations.forEach((res, index) => {
        console.log(`📋 Reservation #${index + 1}:`);
        console.log(`   ID: ${res.id_reservasi}`);
        console.log(`   User: ${res.user.nama_user}`);
        console.log(`   Time: ${res.jam_mulai_reservasi} - ${res.jam_selesai_reservasi}`);
        console.log(`   Status: ${res.status_reservasi}`);
        console.log(`   Payment: ${res.tipe_pembayaran} - ${res.status_pembayaran}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkReservations();
