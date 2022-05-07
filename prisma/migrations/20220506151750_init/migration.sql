-- DropIndex
DROP INDEX `Clients_tb_userId_idx` ON `Clients`;

-- AlterTable
ALTER TABLE `Clients` ADD COLUMN `source` VARCHAR(191) NOT NULL DEFAULT 'tb';
