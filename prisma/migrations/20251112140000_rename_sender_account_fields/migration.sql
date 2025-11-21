-- Rename sender account name columns in reservasi table
ALTER TABLE `reservasi` CHANGE COLUMN `dp_sender_account_name` `nama_rekening_dp` VARCHAR(200) NULL;
ALTER TABLE `reservasi` CHANGE COLUMN `pelunasan_sender_account_name` `nama_rekening_pelunasan` VARCHAR(200) NULL;
