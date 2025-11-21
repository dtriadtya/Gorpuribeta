-- CARA MENJALANKAN MIGRATION INI (MySQL):
-- 1. Buka terminal/command prompt
-- 2. Masuk ke folder project
-- 3. Jalankan: npx prisma db push
-- Atau jalankan SQL ini langsung di MySQL

-- AlterTable members - tambah kolom baru
ALTER TABLE `members` 
ADD COLUMN `package_type` ENUM('1_month', '3_months', '6_months', '12_months') NOT NULL DEFAULT '1_month' AFTER `end_time`,
ADD COLUMN `start_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) AFTER `package_type`,
ADD COLUMN `end_date` DATETIME(3) NULL AFTER `start_date`;

-- Update existing members dengan end_date default (1 bulan dari start_date)
UPDATE `members` 
SET `end_date` = DATE_ADD(`start_date`, INTERVAL 1 MONTH) 
WHERE `end_date` IS NULL;

-- Set end_date sebagai NOT NULL setelah data diupdate
ALTER TABLE `members` 
MODIFY COLUMN `end_date` DATETIME(3) NOT NULL;

-- Verify hasil migration
SELECT id, name, package_type, start_date, end_date FROM members;
