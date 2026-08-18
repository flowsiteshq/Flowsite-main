CREATE TABLE `booking_answers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`questionId` int NOT NULL,
	`answerText` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `booking_answers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questionnaire_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`questionText` text NOT NULL,
	`fieldType` enum('text','textarea','select','radio','checkbox') NOT NULL DEFAULT 'text',
	`options` text,
	`isRequired` int NOT NULL DEFAULT 0,
	`isActive` int NOT NULL DEFAULT 1,
	`placeholder` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `questionnaire_questions_id` PRIMARY KEY(`id`)
);
