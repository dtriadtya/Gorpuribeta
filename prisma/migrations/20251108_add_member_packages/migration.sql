-- AlterTable
ALTER TABLE `members` 
ADD COLUMN `package_type` ENUM('member_1', 'member_2', 'member_3', 'member_4', 'member_5', 'member_6', 'member_plus_12') NOT NULL DEFAULT 'member_1',
ADD COLUMN `start_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
ADD COLUMN `end_date` DATETIME(3);

-- Update existing members with default end_date (1 month from start_date)
UPDATE `members` SET `end_date` = DATE_ADD(`start_date`, INTERVAL 1 MONTH) WHERE `end_date` IS NULL;

-- Make end_date NOT NULL after updating existing records
ALTER TABLE `members` MODIFY COLUMN `end_date` DATETIME(3) NOT NULL;
