const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample fields
  const fields = await Promise.all([
    prisma.field.create({
      data: {
        nama_lapangan: 'Lapangan Futsal A',
        deskripsi: 'Lapangan futsal indoor dengan rumput sintetis berkualitas tinggi',
        harga_per_jam: 150000,
        imageUrl: '/images/futsal-a.jpg',
        fasilitas: ['AC', 'Locker Room', 'Parking', 'Cafe']
      }
    }),
    prisma.field.create({
      data: {
        nama_lapangan: 'Lapangan Futsal B',
        deskripsi: 'Lapangan futsal outdoor dengan pencahayaan LED',
        harga_per_jam: 120000,
        imageUrl: '/images/futsal-b.jpg',
        fasilitas: ['Locker Room', 'Parking', 'Cafe']
      }
    }),
    prisma.field.create({
      data: {
        nama_lapangan: 'Lapangan Badminton',
        deskripsi: 'Lapangan badminton indoor dengan AC dan pencahayaan optimal',
        harga_per_jam: 80000,
        imageUrl: '/images/badminton.jpg',
        fasilitas: ['AC', 'Locker Room', 'Parking']
      }
    }),
    prisma.field.create({
      data: {
        nama_lapangan: 'Lapangan Basket',
        deskripsi: 'Lapangan basket outdoor dengan permukaan berkualitas',
        harga_per_jam: 100000,
        imageUrl: '/images/basket.jpg',
        fasilitas: ['Parking', 'Cafe']
      }
    })
  ]);

  console.log(`✅ Created ${fields.length} fields`);

  // Create field schedules for each field
  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  
  for (const field of fields) {
    const schedules = await Promise.all(
      daysOfWeek.map(day =>
        prisma.fieldSchedule.create({
          data: {
            id_lapangan: field.id_lapangan,
            dayOfWeek: day,
            jam_mulai_jadwal: '06:00:00',
            jam_selesai_jadwal: '22:00:00',
            isActive: true
          }
        })
      )
    );
    console.log(`✅ Created ${schedules.length} schedules for ${field.nama_lapangan}`);
  }

  // Create sample admin user
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.create({
    data: {
      nama_user: 'Admin',
      email_user: 'admin@sportreservation.com',
      password: hashedPassword,
      phone_user: '+62 812-3456-7890',
      role: 'ADMIN'
    }
  });

  console.log('✅ Created admin user');

  // Create sample regular user
  const userPassword = await bcrypt.hash('user123', 12);
  
  const regularUser = await prisma.user.create({
    data: {
      nama_user: 'John Doe',
      email_user: 'john@example.com',
      password: userPassword,
      phone_user: '+62 812-3456-7891',
      role: 'USER'
    }
  });

  console.log('✅ Created regular user');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Sample accounts:');
  console.log('Admin: admin@sportreservation.com / admin123');
  console.log('User: john@example.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
