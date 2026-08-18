ALTER TABLE `email_auth` ADD `resetToken` varchar(128);--> statement-breakpoint
ALTER TABLE `email_auth` ADD `resetTokenExpiry` int unsigned;