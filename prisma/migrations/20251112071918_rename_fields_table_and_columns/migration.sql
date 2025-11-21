-- DropForeignKey
ALTER TABLE `field_schedules` DROP FOREIGN KEY `field_schedules_field_id_fkey`;

-- DropForeignKey
ALTER TABLE `members` DROP FOREIGN KEY `members_field_id_fkey`;

-- DropForeignKey
ALTER TABLE `reservations` DROP FOREIGN KEY `reservations_field_id_fkey`;

-- Rename table
RENAME TABLE `fields` TO `lapangan`;

-- Rename and modify columns
ALTER TABLE `lapangan` 
  CHANGE COLUMN `id` `id_lapangan` INTEGER NOT NULL AUTO_INCREMENT,
  CHANGE COLUMN `name` `nama_lapangan` VARCHAR(100) NOT NULL,
  CHANGE COLUMN `description` `deskripsi` TEXT NULL,
  CHANGE COLUMN `price_per_hour` `harga_per_jam` DECIMAL(10, 2) NOT NULL,
  CHANGE COLUMN `facilities` `fasilitas` JSON NULL,
  CHANGE COLUMN `created_at` `lapangan_dibuat_pada` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CHANGE COLUMN `updated_at` `lapangan_diupdate_pada` DATETIME(3) NOT NULL;

-- AddForeignKey
ALTER TABLE `field_schedules` ADD CONSTRAINT `field_schedules_field_id_fkey` FOREIGN KEY (`field_id`) REFERENCES `lapangan`(`id_lapangan`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservations` ADD CONSTRAINT `reservations_field_id_fkey` FOREIGN KEY (`field_id`) REFERENCES `lapangan`(`id_lapangan`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `members` ADD CONSTRAINT `members_field_id_fkey` FOREIGN KEY (`field_id`) REFERENCES `lapangan`(`id_lapangan`) ON DELETE CASCADE ON UPDATE CASCADE;
