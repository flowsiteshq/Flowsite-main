ALTER TABLE `wizard_submissions` ADD `source` enum('website','cold_call','referral','social','partner','other');--> statement-breakpoint
ALTER TABLE `wizard_submissions` ADD `adminNotes` text;--> statement-breakpoint
ALTER TABLE `wizard_submissions` ADD `followUpDate` varchar(10);--> statement-breakpoint
ALTER TABLE `wizard_submissions` ADD `assignedTechnicianId` int;--> statement-breakpoint
ALTER TABLE `wizard_submissions` ADD `assignedPartnerId` int;