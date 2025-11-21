const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Creating admin user...');

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@gorpuribeta.com' }
  });

  if (existingAdmin) {
    console.log('⚠️  Admin already exists!');
    console.log('Email:', existingAdmin.email);
    console.log('Name:', existingAdmin.name);
    console.log('Role:', existingAdmin.role);
    return;
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin GOR Puri Beta',
      email: 'admin@gorpuribeta.com',
      password: hashedPassword,
      phone: '081234567890',
      role: 'ADMIN',
      isActive: true
    }
  });

  console.log('✅ Admin user created successfully!');
  console.log('\n📝 Admin credentials:');
  console.log('Email: admin@gorpuribeta.com');
  console.log('Password: admin123');
  console.log('\n⚠️  Please change the password after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Error creating admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
