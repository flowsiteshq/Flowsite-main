CREATE TABLE `client_portal_passwords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientEmail` varchar(320) NOT NULL,
	`passwordHash` text NOT NULL,
	`setupToken` varchar(128),
	`setupTokenExpiry` bigint,
	`resetToken` varchar(128),
	`resetTokenExpiry` bigint,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `client_portal_passwords_id` PRIMARY KEY(`id`),
	CONSTRAINT `client_portal_passwords_clientEmail_unique` UNIQUE(`clientEmail`)
);
--> statement-breakpoint
CREATE TABLE `client_portal_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientEmail` varchar(320) NOT NULL,
	`sessionToken` varchar(128) NOT NULL,
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `client_portal_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `client_portal_sessions_sessionToken_unique` UNIQUE(`sessionToken`)
);
