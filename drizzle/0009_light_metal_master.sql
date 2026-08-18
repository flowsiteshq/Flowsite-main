CREATE TABLE `feature_upgrade_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`clientOpenId` varchar(64),
	`clientName` varchar(255),
	`featureId` varchar(100) NOT NULL,
	`featureLabel` varchar(255) NOT NULL,
	`featurePrice` int NOT NULL,
	`clientNotes` text,
	`status` enum('pending','quoted','approved','in_progress','completed','declined') NOT NULL DEFAULT 'pending',
	`adminResponse` text,
	`agreedPrice` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feature_upgrade_requests_id` PRIMARY KEY(`id`)
);
