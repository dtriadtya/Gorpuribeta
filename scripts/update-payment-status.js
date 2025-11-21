const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updatePaymentStatus() {
  try {
    console.log('🔄 Updating FULL payment status from old values...');
    
    // Update DP_SENT to FULL_SENT for FULL payments
    const sentResult = await prisma.$executeRaw`
      UPDATE reservasi 
      SET status_pembayaran = 'FULL_SENT' 
      WHERE tipe_pembayaran = 'FULL' 
        AND status_pembayaran = 'DP_SENT'
    `;
    
    console.log(`✅ Updated ${sentResult} records from DP_SENT to FULL_SENT`);
    
    // Update DP_REJECTED to FULL_REJECTED for FULL payments
    const rejectedResult = await prisma.$executeRaw`
      UPDATE reservasi 
      SET status_pembayaran = 'FULL_REJECTED' 
      WHERE tipe_pembayaran = 'FULL' 
        AND status_pembayaran = 'DP_REJECTED'
    `;
    
    console.log(`✅ Updated ${rejectedResult} records from DP_REJECTED to FULL_REJECTED`);
    
    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Error updating payment status:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updatePaymentStatus();
