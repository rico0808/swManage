-- CreateTable
CREATE TABLE `Goods` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `traffic` BIGINT NOT NULL DEFAULT 0,
    `days` INTEGER NOT NULL DEFAULT 30,
    `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Goods_sku_key`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;