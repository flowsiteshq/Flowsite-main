-- Admin 3.1 additive migration.
-- Apply only after read-only metadata verification in the target environment.
-- Does not alter customer, invoice, subscription, or payment records.

CREATE TABLE IF NOT EXISTS knowledge_articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(160) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  category ENUM('company_information','services_pricing','cue_ai_training','sales_playbooks','customer_support','internal_procedures') NOT NULL,
  content TEXT NOT NULL,
  access ENUM('public','internal') NOT NULL DEFAULT 'internal',
  status ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  authorOpenId VARCHAR(128) NULL,
  authorName VARCHAR(255) NULL,
  cueSyncStatus ENUM('not_synced','pending_manual_sync','synced','error') NOT NULL DEFAULT 'not_synced',
  cueSyncError TEXT NULL,
  publishedAt TIMESTAMP NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('failed_payment','overdue_invoice','new_customer','website_approval','cue_escalation','cancellation_request') NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  href VARCHAR(500) NOT NULL,
  entityType VARCHAR(80) NULL,
  entityId INT NULL,
  dedupeKey VARCHAR(255) NOT NULL UNIQUE,
  isRead INT NOT NULL DEFAULT 0,
  readAt TIMESTAMP NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Verification queries:
-- SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('knowledge_articles','admin_notifications');
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'knowledge_articles';
