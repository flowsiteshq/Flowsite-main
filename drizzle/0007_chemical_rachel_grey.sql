CREATE TABLE `change_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`clientOpenId` varchar(64),
	`clientName` varchar(255),
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`pageSection` varchar(255),
	`status` enum('pending','in_review','approved','in_progress','completed','declined') NOT NULL DEFAULT 'pending',
	`adminResponse` text,
	`estimatedHours` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `change_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `client_projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientOpenId` varchar(64),
	`clientName` varchar(255) NOT NULL,
	`clientEmail` varchar(320) NOT NULL,
	`clientPhone` varchar(50),
	`businessName` varchar(255) NOT NULL,
	`websiteDomain` varchar(255),
	`previewUrl` varchar(500),
	`status` enum('onboarding','design','development','review','revisions','launch','maintenance','paused') NOT NULL DEFAULT 'onboarding',
	`currentStage` int NOT NULL DEFAULT 0,
	`stageProgress` int NOT NULL DEFAULT 0,
	`adminNotes` text,
	`clientMessage` text,
	`accessToken` varchar(64),
	`packageName` varchar(100),
	`monthlyPrice` int,
	`estimatedLaunchDate` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `client_projects_id` PRIMARY KEY(`id`)
);
