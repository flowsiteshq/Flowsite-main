-- Additive Google Calendar / Meet integration migration.
-- Applied manually against the existing FlowSites database because the historical
-- Drizzle journal contains migration drift and cannot safely replay old tables.

CREATE TABLE IF NOT EXISTS `google_calendar_connections` (
  `id` int AUTO_INCREMENT NOT NULL,
  `accountEmail` varchar(320) NOT NULL,
  `calendarId` varchar(320) NOT NULL DEFAULT 'primary',
  `encryptedRefreshToken` text NOT NULL,
  `scopes` text NOT NULL,
  `connectedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `google_calendar_connections_accountEmail_unique` (`accountEmail`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- The three bookings columns were applied idempotently by the deployment script.
-- They are intentionally nullable/defaulted so existing bookings remain untouched.
