CREATE TABLE `analytics_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`token` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `analytics_tokens_projectId_unique` UNIQUE(`projectId`),
	CONSTRAINT `analytics_tokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `page_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`pagePath` varchar(500) NOT NULL DEFAULT '/',
	`sessionId` varchar(64) NOT NULL,
	`referrer` varchar(500),
	`utmSource` varchar(100),
	`utmMedium` varchar(100),
	`utmCampaign` varchar(100),
	`deviceType` enum('desktop','mobile','tablet') DEFAULT 'desktop',
	`country` varchar(2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `page_views_id` PRIMARY KEY(`id`)
);
