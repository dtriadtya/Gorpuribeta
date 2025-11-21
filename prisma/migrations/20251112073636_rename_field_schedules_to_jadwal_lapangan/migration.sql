-- Drop foreign key first
ALTER TABLE `field_schedules` DROP FOREIGN KEY `field_schedules_field_id_fkey`;

-- Drop old index
DROP INDEX `field_schedules_field_id_fkey` ON `field_schedules`;

-- Rename columns
ALTER TABLE `field_schedules` CHANGE COLUMN `id` `id_jadwal` INTEGER NOT NULL AUTO_INCREMENT;
ALTER TABLE `field_schedules` CHANGE COLUMN `field_id` `id_lapangan` INTEGER NOT NULL;
ALTER TABLE `field_schedules` CHANGE COLUMN `start_time` `jam_mulai_jadwal` VARCHAR(191) NOT NULL;
ALTER TABLE `field_schedules` CHANGE COLUMN `end_time` `jam_selesai_jadwal` VARCHAR(191) NOT NULL;
ALTER TABLE `field_schedules` CHANGE COLUMN `is_available` `is_active` BOOLEAN NOT NULL DEFAULT true;

-- Rename table
RENAME TABLE `field_schedules` TO `jadwal_lapangan`;

-- Add new index
CREATE INDEX `jadwal_lapangan_id_lapangan_fkey` ON `jadwal_lapangan`(`id_lapangan`);

-- Add foreign key with new table and column names
ALTER TABLE `jadwal_lapangan` ADD CONSTRAINT `jadwal_lapangan_id_lapangan_fkey` FOREIGN KEY (`id_lapangan`) REFERENCES `lapangan`(`id_lapangan`) ON DELETE CASCADE ON UPDATE CASCADE;
