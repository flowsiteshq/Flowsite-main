CREATE TABLE `client_pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientAccountId` int NOT NULL,
	`title` varchar(100) NOT NULL,
	`path` varchar(255) NOT NULL,
	`description` text,
	`status` enum('live','draft','in_progress') NOT NULL DEFAULT 'live',
	`lastUpdated` varchar(50),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `client_pages_id` PRIMARY KEY(`id`)
);
