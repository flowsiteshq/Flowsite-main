ALTER TABLE `client_invoices` ADD `invoiceType` enum('monthly','addon') DEFAULT 'monthly' NOT NULL;--> statement-breakpoint
ALTER TABLE `client_invoices` ADD `addonRequestId` int;