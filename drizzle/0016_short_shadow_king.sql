CREATE TABLE `partners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(50),
	`companyName` varchar(255),
	`commissionRate` int NOT NULL DEFAULT 15,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partners_id` PRIMARY KEY(`id`),
	CONSTRAINT `partners_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `technician_commissions` MODIFY COLUMN `technicianId` int;--> statement-breakpoint
ALTER TABLE `technician_commissions` ADD `commissionType` enum('rep','partner') DEFAULT 'rep' NOT NULL;--> statement-breakpoint
ALTER TABLE `technician_commissions` ADD `partnerId` int;--> statement-breakpoint
ALTER TABLE `technician_commissions` ADD `chargebackDeductionCents` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `technician_commissions` ADD `netCommissionCents` int NOT NULL;