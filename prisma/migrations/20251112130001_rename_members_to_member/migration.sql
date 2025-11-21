/*
  Manual migration to rename members table and fields while preserving data
*/

-- Drop foreign key
ALTER TABLE `members` DROP FOREIGN KEY `members_field_id_fkey`;

-- Drop old index
DROP INDEX `members_field_id_fkey` ON `members`;

-- Rename columns
ALTER TABLE `members` CHANGE COLUMN `id` `id_member` INTEGER NOT NULL AUTO_INCREMENT;
ALTER TABLE `members` CHANGE COLUMN `name` `nama_member` VARCHAR(100) NOT NULL;
ALTER TABLE `members` CHANGE COLUMN `contact_name` `kontak_member` VARCHAR(100) NOT NULL;
ALTER TABLE `members` CHANGE COLUMN `field_id` `id_lapangan` INTEGER NOT NULL;
ALTER TABLE `members` CHANGE COLUMN `start_time` `jam_mulai_member` VARCHAR(191) NOT NULL;
ALTER TABLE `members` CHANGE COLUMN `end_time` `jam_selesai_member` VARCHAR(191) NOT NULL;
ALTER TABLE `members` CHANGE COLUMN `package_type` `jenis_paket_member` ENUM('member_1', 'member_2', 'member_3', 'member_4', 'member_5', 'member_6', 'member_plus_12') NOT NULL DEFAULT 'member_1';
ALTER TABLE `members` CHANGE COLUMN `start_date` `tanggal_mulai_member` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
ALTER TABLE `members` CHANGE COLUMN `end_date` `tanggal_berakhir_member` DATETIME(3) NOT NULL;
ALTER TABLE `members` CHANGE COLUMN `created_at` `member_dibuat_pada` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
ALTER TABLE `members` CHANGE COLUMN `updated_at` `member_diupdate_pada` DATETIME(3) NOT NULL;

-- Rename table
RENAME TABLE `members` TO `member`;

-- Create new index
CREATE INDEX `member_id_lapangan_fkey` ON `member`(`id_lapangan`);

-- Add foreign key with new name
ALTER TABLE `member` ADD CONSTRAINT `member_id_lapangan_fkey` FOREIGN KEY (`id_lapangan`) REFERENCES `lapangan`(`id_lapangan`) ON DELETE CASCADE ON UPDATE CASCADE;
