CREATE TABLE `technician_commissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`technicianId` int NOT NULL,
	`clientAccountId` int NOT NULL,
	`invoiceId` int NOT NULL,
	`commissionRate` int NOT NULL,
	`invoiceAmountCents` int NOT NULL,
	`commissionAmountCents` int NOT NULL,
	`status` enum('pending','paid','cancelled') NOT NULL DEFAULT 'pending',
	`paidAt` timestamp,
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `technician_commissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `technician_invites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`technicianId` int NOT NULL,
	`token` varchar(64) NOT NULL,
	`email` varchar(320) NOT NULL,
	`usedAt` timestamp,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `technician_invites_id` PRIMARY KEY(`id`),
	CONSTRAINT `technician_invites_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `technicians` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`openId` varchar(64),
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`commissionRate` int NOT NULL DEFAULT 15,
	`status` enum('invited','active','inactive') NOT NULL DEFAULT 'invited',
	`notes` text,
	`invitedAt` timestamp NOT NULL DEFAULT (now()),
	`joinedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `technicians_id` PRIMARY KEY(`id`),
	CONSTRAINT `technicians_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `client_accounts` ADD `assignedTechnicianId` int;