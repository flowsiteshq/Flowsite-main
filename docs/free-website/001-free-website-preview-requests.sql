-- Additive migration for the Free Website Program request ledger.
-- This creates a request record linked to the existing wizard_submissions CRM lead.
-- Run only through the approved database migration process after a verified backup.

CREATE TABLE IF NOT EXISTS `free_website_preview_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
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
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
