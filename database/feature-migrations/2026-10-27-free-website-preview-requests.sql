-- Feature migration: Free Website Program request and staff-review ledger.
-- Preconditions:
--   1. Confirm `free_website_preview_requests` is absent (or has a reviewed compatible schema).
--   2. Do not replay legacy drizzle migrations to apply this file.
--   3. Run against the intended environment only after a verified backup.
--
-- This migration is additive. It creates no customer communication, checkout,
-- payment, subscription, or automated delivery behavior.

CREATE TABLE IF NOT EXISTS `free_website_preview_requests` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `leadId` INT NOT NULL,
  `businessName` VARCHAR(255) NOT NULL,
  `contactName` VARCHAR(255) NOT NULL,
  `industry` VARCHAR(100) NOT NULL,
  `businessLocation` VARCHAR(255) NULL,
  `phone` VARCHAR(50) NOT NULL,
  `email` VARCHAR(320) NOT NULL,
  `existingWebsiteUrl` VARCHAR(500) NULL,
  `desiredWebsiteFeatures` TEXT NULL,
  `businessDescription` TEXT NULL,
  `preferredContactMethod` ENUM('phone', 'email', 'either') NOT NULL DEFAULT 'either',
  `marketingSmsConsent` INT NOT NULL DEFAULT 0,
  `marketingConsentAt` TIMESTAMP NULL,
  `consentDisclosureVersion` VARCHAR(64) NULL,
  `status` ENUM('new', 'under_review', 'qualified', 'preview_requested', 'preview_ready', 'preview_delivered', 'closed') NOT NULL DEFAULT 'new',
  `internalNotes` TEXT NULL,
  `previewUrl` VARCHAR(1000) NULL,
  `deliveryChecklistComplete` INT NOT NULL DEFAULT 0,
  `reviewedAt` TIMESTAMP NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `free_website_preview_requests_id` PRIMARY KEY (`id`),
  INDEX `free_website_preview_requests_lead_idx` (`leadId`),
  INDEX `free_website_preview_requests_status_created_idx` (`status`, `createdAt`)
);

-- Verification (read-only):
-- SELECT column_name, column_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = DATABASE()
--   AND table_name = 'free_website_preview_requests'
-- ORDER BY ordinal_position;
