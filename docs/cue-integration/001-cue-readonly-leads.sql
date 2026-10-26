-- Cue AI read-only FlowSites lead access
-- Additive only: creates dedicated service-key and audit tables.
-- No existing customer, lead, billing, or staff tables are changed.

CREATE TABLE IF NOT EXISTS `cue_integration_keys` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(80) NOT NULL,
  `keyPrefix` varchar(32) NOT NULL,
  `tokenHash` varchar(64) NOT NULL,
  `scope` varchar(64) NOT NULL DEFAULT 'leads:read',
  `createdByOpenId` varchar(64) NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastUsedAt` timestamp NULL,
  `expiresAt` timestamp NULL,
  `revokedAt` timestamp NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cue_integration_keys_tokenHash_unique` (`tokenHash`)
);

CREATE TABLE IF NOT EXISTS `cue_integration_audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `keyId` int NOT NULL,
  `eventType` varchar(64) NOT NULL,
  `resultCount` int NOT NULL DEFAULT 0,
  `requestId` varchar(64) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
