ALTER TABLE `products` MODIFY COLUMN `sizes` varchar(255) NOT NULL DEFAULT '[]';--> statement-breakpoint
ALTER TABLE `products` ADD `collection` varchar(255);--> statement-breakpoint
ALTER TABLE `products` ADD `images` text;--> statement-breakpoint
ALTER TABLE `products` ADD `features` text;--> statement-breakpoint
ALTER TABLE `products` ADD `specs` text;--> statement-breakpoint
ALTER TABLE `products` ADD `sizeTables` text;--> statement-breakpoint
ALTER TABLE `products` ADD `careInstructions` text;--> statement-breakpoint
ALTER TABLE `products` ADD `careNote` text;--> statement-breakpoint
ALTER TABLE `products` ADD `telegramLink` varchar(500);--> statement-breakpoint
ALTER TABLE `products` ADD `isVisible` tinyint DEFAULT 1 NOT NULL;