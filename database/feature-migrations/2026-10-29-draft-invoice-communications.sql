-- FlowSites additive migration: draft invoice communications
-- Safe boundary: adds columns/table only; never updates or deletes existing customer financial records.
ALTER TABLE client_invoices
  ADD COLUMN emailDeliveryStatus ENUM('pending','sent','delivered','bounced','failed') NOT NULL DEFAULT 'pending',
  ADD COLUMN emailSentAt TIMESTAMP NULL,
  ADD COLUMN emailDeliveredAt TIMESTAMP NULL,
  ADD COLUMN emailLastError TEXT NULL,
  ADD COLUMN communicationMode ENUM('invoice_only','invoice_welcome','invoice_custom','invoice_cue') NOT NULL DEFAULT 'invoice_only',
  ADD COLUMN emailSubject VARCHAR(255) NULL,
  ADD COLUMN emailBodyHtml TEXT NULL,
  ADD COLUMN finalizedAt TIMESTAMP NULL,
  ADD COLUMN finalizedByOpenId VARCHAR(64) NULL;

CREATE TABLE invoice_activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  clientAccountId INT NOT NULL,
  invoiceId INT NULL,
  activityType VARCHAR(64) NOT NULL,
  deliveryStatus VARCHAR(32) NULL,
  details TEXT NULL,
  performedByOpenId VARCHAR(64) NULL,
  performedByName VARCHAR(255) NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX invoice_activities_account_idx (clientAccountId),
  INDEX invoice_activities_invoice_idx (invoiceId),
  INDEX invoice_activities_created_idx (createdAt)
);
