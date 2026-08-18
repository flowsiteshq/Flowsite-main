CREATE TABLE `marketing_optins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(50) NOT NULL,
	`businessName` varchar(255) NOT NULL,
	`website` varchar(500),
	`source` varchar(100) DEFAULT 'email_blast',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `marketing_optins_id` PRIMARY KEY(`id`)
);
