CREATE TABLE `email_auth` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` text NOT NULL,
	`emailVerified` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_auth_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_auth_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `email_auth_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `email_auth_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionToken` varchar(128) NOT NULL,
	`userAgent` text,
	`isAdmin` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `email_auth_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_auth_sessions_sessionToken_unique` UNIQUE(`sessionToken`)
);
