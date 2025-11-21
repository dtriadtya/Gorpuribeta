const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkMemberSchedule() {
  try {
    console.log('🔍 Checking member schedule data...\n');
    
    const members = await prisma.member.findMany({
      where: {
        isActive: true
      },
      include: {
        lapangan: {
          select: {
            nama_lapangan: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    if (members.length === 0) {
      console.log('❌ No active members found');
      return;
    }
    
    console.log(`✅ Found ${members.length} active member(s):\n`);
    
    members.forEach((member, index) => {
      console.log(`📋 Member #${index + 1}:`);
      console.log(`   ID: ${member.id_member}`);
      console.log(`   Nama: ${member.nama_member}`);
      console.log(`   Kontak: ${member.kontak_member}`);
      console.log(`   Lapangan: ${member.lapangan.nama_lapangan}`);
      console.log(`   Hari: ${member.dayOfWeek}`);
      console.log(`   Jam: ${member.jam_mulai_member} - ${member.jam_selesai_member}`);
      console.log(`   Periode: ${new Date(member.tanggal_mulai_member).toLocaleDateString('id-ID')} s/d ${new Date(member.tanggal_berakhir_member).toLocaleDateString('id-ID')}`);
      console.log(`   Status: ${member.isActive ? 'Aktif' : 'Tidak Aktif'}`);
      console.log('');
    });
    
    // Check upcoming THURSDAY dates
    console.log('\n🗓️  Checking upcoming THURSDAY dates:');
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      
      if (checkDate.getDay() === 4) { // Thursday
        console.log(`   ${checkDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMemberSchedule();
