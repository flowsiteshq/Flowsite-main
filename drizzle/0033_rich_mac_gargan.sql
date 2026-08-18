CREATE TABLE `heatmap_clicks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`pagePath` varchar(500) NOT NULL DEFAULT '/',
	`xPct` float NOT NULL,
	`yPct` float NOT NULL,
	`sessionId` varchar(64),
	`deviceType` enum('desktop','mobile','tablet') DEFAULT 'desktop',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `heatmap_clicks_id` PRIMARY KEY(`id`)
);
