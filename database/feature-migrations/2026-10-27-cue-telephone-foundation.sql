-- Cue and ElevenLabs telephone foundation
--
-- This feature-ledger migration is deliberately additive. It does not modify
-- legacy Drizzle journal history. It may be applied once in an approved
-- development/staging environment before any telephone routing is configured.
--
-- No rows create an agent, phone number, forward, call, message, payment, or
-- external provider configuration.

CREATE TABLE IF NOT EXISTS `cue_integration_keys` (
  `id` int AUTO_INCREMENT NOT NULL,
  `label` varchar(80) NOT NULL,
  `keyPrefix` varchar(32) NOT NULL,
  `tokenHash` varchar(64) NOT NULL,
  `scope` varchar(64) NOT NULL DEFAULT 'leads:read',
  `createdByOpenId` varchar(64),
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastUsedAt` timestamp,
  `expiresAt` timestamp,
  `revokedAt` timestamp,
  CONSTRAINT `cue_integration_keys_id` PRIMARY KEY(`id`),
  CONSTRAINT `cue_integration_keys_tokenHash_unique` UNIQUE(`tokenHash`)
);

CREATE TABLE IF NOT EXISTS `cue_integration_audit_logs` (
  `id` int AUTO_INCREMENT NOT NULL,
  `keyId` int NOT NULL,
  `eventType` varchar(64) NOT NULL,
  `resultCount` int NOT NULL DEFAULT 0,
  `requestId` varchar(64) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `cue_integration_audit_logs_id` PRIMARY KEY(`id`)
);

ALTER TABLE `wizard_submissions`
  ADD COLUMN IF NOT EXISTS `contactName` varchar(255) NULL AFTER `businessName`;

ALTER TABLE `wizard_submissions`
  MODIFY COLUMN `source` enum('website','cold_call','referral','social','partner','ai_voice','other') NULL;

CREATE TABLE IF NOT EXISTS `voice_integration_keys` (
  `id` int AUTO_INCREMENT NOT NULL,
  `label` varchar(80) NOT NULL,
  `keyPrefix` varchar(32) NOT NULL,
  `tokenHash` varchar(64) NOT NULL,
  `scope` varchar(64) NOT NULL DEFAULT 'phone_leads:write',
  `createdByOpenId` varchar(64),
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastUsedAt` timestamp,
  `expiresAt` timestamp,
  `revokedAt` timestamp,
  CONSTRAINT `voice_integration_keys_id` PRIMARY KEY(`id`),
  CONSTRAINT `voice_integration_keys_tokenHash_unique` UNIQUE(`tokenHash`)
);

CREATE TABLE IF NOT EXISTS `voice_call_events` (
  `id` int AUTO_INCREMENT NOT NULL,
  `provider` varchar(64) NOT NULL,
  `providerEventId` varchar(255) NOT NULL,
  `providerCallId` varchar(191) NOT NULL,
  `eventType` varchar(80) NOT NULL,
  `leadId` int,
  `normalizedPhone` varchar(50),
  `summary` text,
  `source` enum('agent_tool','signed_webhook') NOT NULL,
  `eventTimestamp` timestamp NULL,
  `receivedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `voice_call_events_id` PRIMARY KEY(`id`),
  CONSTRAINT `voice_call_events_providerEventId_unique` UNIQUE(`providerEventId`)
);
