-- Migration: Update existing FULL payment records to use new status values
-- Date: 2025-11-13
-- Description: Change DP_SENT to FULL_SENT and DP_REJECTED to FULL_REJECTED for FULL payment type

-- Update FULL payment that are currently using DP_SENT status
UPDATE reservasi 
SET status_pembayaran = 'FULL_SENT' 
WHERE tipe_pembayaran = 'FULL' 
  AND status_pembayaran = 'DP_SENT';

-- Update FULL payment that are currently using DP_REJECTED status
UPDATE reservasi 
SET status_pembayaran = 'FULL_REJECTED' 
WHERE tipe_pembayaran = 'FULL' 
  AND status_pembayaran = 'DP_REJECTED';

-- Verify the changes
SELECT 
    id_reservasi,
    tipe_pembayaran,
    status_pembayaran,
    status_reservasi
FROM reservasi 
WHERE tipe_pembayaran = 'FULL'
ORDER BY reservasi_dibuat_pada DESC;
