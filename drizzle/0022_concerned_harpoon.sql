CREATE TABLE `opportunity_pool` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessName` varchar(255) NOT NULL,
	`websiteUrl` varchar(500),
	`businessType` varchar(100),
	`location` varchar(255),
	`description` text,
	`estimatedMonthlyCents` int NOT NULL DEFAULT 4900,
	`source` varchar(100) NOT NULL DEFAULT 'portfolio',
	`status` enum('available','claimed','converted','inactive') NOT NULL DEFAULT 'available',
	`claimedByTechnicianId` int,
	`claimedAt` timestamp,
	`isActive` int NOT NULL DEFAULT 1,
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `opportunity_pool_id` PRIMARY KEY(`id`)
);
