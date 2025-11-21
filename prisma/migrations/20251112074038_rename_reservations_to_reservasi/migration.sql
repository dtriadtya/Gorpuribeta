-- Drop foreign keys first
ALTER TABLE `reservations` DROP FOREIGN KEY `reservations_dp_validated_by_fkey`;
ALTER TABLE `reservations` DROP FOREIGN KEY `reservations_field_id_fkey`;
ALTER TABLE `reservations` DROP FOREIGN KEY `reservations_payment_validated_by_fkey`;
ALTER TABLE `reservations` DROP FOREIGN KEY `reservations_pelunasan_validated_by_fkey`;
ALTER TABLE `reservations` DROP FOREIGN KEY `reservations_user_id_fkey`;

-- Drop old indexes
DROP INDEX `reservations_dp_validated_by_fkey` ON `reservations`;
DROP INDEX `reservations_field_id_fkey` ON `reservations`;
DROP INDEX `reservations_payment_validated_by_fkey` ON `reservations`;
DROP INDEX `reservations_pelunasan_validated_by_fkey` ON `reservations`;
DROP INDEX `reservations_user_id_fkey` ON `reservations`;

-- Rename columns
ALTER TABLE `reservations` CHANGE COLUMN `id` `id_reservasi` INTEGER NOT NULL AUTO_INCREMENT;
ALTER TABLE `reservations` CHANGE COLUMN `user_id` `id_user` INTEGER NOT NULL;
ALTER TABLE `reservations` CHANGE COLUMN `field_id` `id_lapangan` INTEGER NOT NULL;
ALTER TABLE `reservations` CHANGE COLUMN `reservation_date` `tanggal_reservasi` DATETIME(3) NOT NULL;
ALTER TABLE `reservations` CHANGE COLUMN `start_time` `jam_mulai_reservasi` VARCHAR(191) NOT NULL;
ALTER TABLE `reservations` CHANGE COLUMN `end_time` `jam_selesai_reservasi` VARCHAR(191) NOT NULL;
ALTER TABLE `reservations` CHANGE COLUMN `total_price` `total_harga` DECIMAL(10, 2) NOT NULL;
ALTER TABLE `reservations` CHANGE COLUMN `status` `status_reservasi` ENUM('PENDING', 'DP_SENT', 'DP_PAID', 'DP_REJECTED', 'PELUNASAN_SENT', 'PELUNASAN_PAID', 'REJECTED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'PENDING';
ALTER TABLE `reservations` CHANGE COLUMN `payment_status` `status_pembayaran` ENUM('PENDING', 'DP_SENT', 'DP_PAID', 'DP_REJECTED', 'PELUNASAN_SENT', 'PELUNASAN_REJECTED', 'PELUNASAN_PAID', 'PAID', 'REFUNDED') NOT NULL DEFAULT 'PENDING';
ALTER TABLE `reservations` CHANGE COLUMN `payment_type` `tipe_pembayaran` ENUM('FULL', 'DP') NOT NULL DEFAULT 'FULL';
ALTER TABLE `reservations` CHANGE COLUMN `payment_proof` `bukti_lunas` VARCHAR(500) NULL;
ALTER TABLE `reservations` CHANGE COLUMN `dp_proof` `bukti_dp` VARCHAR(500) NULL;
ALTER TABLE `reservations` CHANGE COLUMN `pelunasan_proof` `bukti_pelunasan` VARCHAR(500) NULL;
ALTER TABLE `reservations` CHANGE COLUMN `payment_validated_by` `validasi_lunas_oleh` INTEGER NULL;
ALTER TABLE `reservations` CHANGE COLUMN `dp_validated_by` `validasi_dp_oleh` INTEGER NULL;
ALTER TABLE `reservations` CHANGE COLUMN `pelunasan_validated_by` `validasi_pelunasan_oleh` INTEGER NULL;
ALTER TABLE `reservations` CHANGE COLUMN `created_at` `reservasi_dibuat_pada` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
ALTER TABLE `reservations` CHANGE COLUMN `updated_at` `reservasi_diupdate_pada` DATETIME(3) NOT NULL;

-- Rename table
RENAME TABLE `reservations` TO `reservasi`;

-- Add new indexes
CREATE INDEX `reservasi_validasi_dp_oleh_fkey` ON `reservasi`(`validasi_dp_oleh`);
CREATE INDEX `reservasi_id_lapangan_fkey` ON `reservasi`(`id_lapangan`);
CREATE INDEX `reservasi_validasi_lunas_oleh_fkey` ON `reservasi`(`validasi_lunas_oleh`);
CREATE INDEX `reservasi_validasi_pelunasan_oleh_fkey` ON `reservasi`(`validasi_pelunasan_oleh`);
CREATE INDEX `reservasi_id_user_fkey` ON `reservasi`(`id_user`);

-- Add foreign keys with new names
ALTER TABLE `reservasi` ADD CONSTRAINT `reservasi_validasi_dp_oleh_fkey` FOREIGN KEY (`validasi_dp_oleh`) REFERENCES `user`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `reservasi` ADD CONSTRAINT `reservasi_id_lapangan_fkey` FOREIGN KEY (`id_lapangan`) REFERENCES `lapangan`(`id_lapangan`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `reservasi` ADD CONSTRAINT `reservasi_validasi_lunas_oleh_fkey` FOREIGN KEY (`validasi_lunas_oleh`) REFERENCES `user`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `reservasi` ADD CONSTRAINT `reservasi_validasi_pelunasan_oleh_fkey` FOREIGN KEY (`validasi_pelunasan_oleh`) REFERENCES `user`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `reservasi` ADD CONSTRAINT `reservasi_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `user`(`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;
