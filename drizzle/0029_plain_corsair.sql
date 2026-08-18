CREATE TABLE `sms_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int,
	`clientAccountId` int,
	`direction` enum('outbound','inbound') NOT NULL DEFAULT 'outbound',
	`contactPhone` varchar(30) NOT NULL,
	`message` text NOT NULL,
	`sentBy` varchar(100),
	`sentByOpenId` varchar(100),
	`conversationId` varchar(100),
	`status` enum('sent','failed','delivered') NOT NULL DEFAULT 'sent',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sms_logs_id` PRIMARY KEY(`id`)
);
