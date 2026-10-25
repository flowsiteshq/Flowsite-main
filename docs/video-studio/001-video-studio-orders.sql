CREATE TABLE IF NOT EXISTS `video_orders` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `orderNumber` VARCHAR(32) NOT NULL,
  `clientName` VARCHAR(255) NOT NULL,
  `businessName` VARCHAR(255) NOT NULL,
  `email` VARCHAR(320) NOT NULL,
  `phone` VARCHAR(50),
  `packageId` ENUM('social_spark','business_spotlight','cinematic_pro') NOT NULL,
  `amountCents` INT NOT NULL,
  `businessDescription` TEXT NOT NULL,
  `videoGoal` TEXT,
  `callToAction` VARCHAR(255),
  `requestedAspectRatio` ENUM('landscape','portrait') NOT NULL DEFAULT 'landscape',
  `uploadToken` VARCHAR(96) NOT NULL,
  `stripeCheckoutSessionId` VARCHAR(255),
  `stripePaymentIntentId` VARCHAR(255),
  `status` ENUM('pending_payment','paid','in_production','review','revision_requested','delivered','cancelled') NOT NULL DEFAULT 'pending_payment',
  `adminNotes` TEXT,
  `revisionNotes` TEXT,
  `previewUrl` VARCHAR(1000),
  `deliveryUrl` VARCHAR(1000),
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `video_orders_id` PRIMARY KEY(`id`),
  CONSTRAINT `video_orders_orderNumber_unique` UNIQUE(`orderNumber`),
  CONSTRAINT `video_orders_uploadToken_unique` UNIQUE(`uploadToken`)
);

CREATE TABLE IF NOT EXISTS `video_order_assets` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `orderId` INT NOT NULL,
  `fileKey` VARCHAR(500) NOT NULL,
  `fileUrl` VARCHAR(1000) NOT NULL,
  `fileName` VARCHAR(255) NOT NULL,
  `mimeType` VARCHAR(100) NOT NULL,
  `fileSizeBytes` INT NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `video_order_assets_id` PRIMARY KEY(`id`)
);
