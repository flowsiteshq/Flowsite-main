-- Customer Removal Control (additive migration)
-- This migration does not drop or alter existing customer, invoice, or Stripe data.

ALTER TABLE `wizard_submissions`
  ADD COLUMN `removedAt` timestamp NULL DEFAULT NULL,
  ADD COLUMN `removedByOpenId` varchar(64) NULL;

ALTER TABLE `client_projects`
  ADD COLUMN `portalAccessRevokedAt` timestamp NULL DEFAULT NULL;

ALTER TABLE `client_accounts`
  ADD COLUMN `removedAt` timestamp NULL DEFAULT NULL,
  ADD COLUMN `removedByOpenId` varchar(64) NULL,
  ADD COLUMN `portalAccessRevokedAt` timestamp NULL DEFAULT NULL;

CREATE TABLE IF NOT EXISTS `customer_removal_audit_logs` (
  `id` int AUTO_INCREMENT NOT NULL,
  `clientAccountId` int NULL,
  `leadId` int NULL,
  `businessName` varchar(255) NOT NULL,
  `clientEmail` varchar(320) NULL,
  `removalReason` text NULL,
  `removalMethod` varchar(64) NOT NULL,
  `performedByOpenId` varchar(64) NULL,
  `performedByName` varchar(255) NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
