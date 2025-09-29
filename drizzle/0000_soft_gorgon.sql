CREATE TABLE `Client` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`address` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `InvoiceItem` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invoiceId` integer NOT NULL,
	`productId` integer NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`unitPrice` real NOT NULL,
	`total` real DEFAULT 0 NOT NULL,
	FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `InvoiceItem_invoiceId_idx` ON `InvoiceItem` (`invoiceId`);--> statement-breakpoint
CREATE INDEX `InvoiceItem_productId_idx` ON `InvoiceItem` (`productId`);--> statement-breakpoint
CREATE TABLE `Invoice` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invoiceNumber` text NOT NULL,
	`clientId` integer NOT NULL,
	`date` integer DEFAULT (unixepoch()) NOT NULL,
	`dueDate` integer,
	`paid` integer DEFAULT false NOT NULL,
	`total` real DEFAULT 0 NOT NULL,
	`note` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Invoice_invoiceNumber_unique` ON `Invoice` (`invoiceNumber`);--> statement-breakpoint
CREATE INDEX `Invoice_clientId_idx` ON `Invoice` (`clientId`);--> statement-breakpoint
CREATE INDEX `Invoice_date_idx` ON `Invoice` (`date`);--> statement-breakpoint
CREATE TABLE `Product` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`price` real NOT NULL,
	`unit` text DEFAULT 'unité',
	`description` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `UserActivityLog` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer,
	`action` text NOT NULL,
	`details` text,
	`ipAddress` text,
	`userAgent` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `UserActivityLog_userId_idx` ON `UserActivityLog` (`userId`);--> statement-breakpoint
CREATE INDEX `UserActivityLog_createdAt_idx` ON `UserActivityLog` (`createdAt`);--> statement-breakpoint
CREATE TABLE `User` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`name` text,
	`loginType` text DEFAULT 'email' NOT NULL,
	`username` text,
	`theme` text DEFAULT 'light' NOT NULL,
	`language` text DEFAULT 'fr' NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `User_email_unique` ON `User` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `User_username_unique` ON `User` (`username`);