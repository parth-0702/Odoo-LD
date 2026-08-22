CREATE TABLE `gt_activity` (
	`id` int AUTO_INCREMENT NOT NULL,
	`destinationId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`category` varchar(80) NOT NULL,
	`description` text,
	`estimatedCost` decimal(10,2) NOT NULL DEFAULT '0',
	`durationMinutes` int,
	CONSTRAINT `gt_activity_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gt_destination` (
	`id` int AUTO_INCREMENT NOT NULL,
	`city` varchar(120) NOT NULL,
	`country` varchar(120) NOT NULL,
	`latitude` decimal(10,7) NOT NULL,
	`longitude` decimal(10,7) NOT NULL,
	`description` text,
	`coverImage` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gt_destination_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gt_expense` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`category` enum('transport','stay','activities','meals','misc') NOT NULL,
	`title` varchar(180) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`expenseDate` date,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gt_expense_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gt_favorite` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`destinationId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gt_favorite_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gt_itinerary_item` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`stopId` int,
	`itineraryDate` date,
	`startTime` varchar(8),
	`type` enum('activity','transport','stay') NOT NULL DEFAULT 'activity',
	`title` varchar(180) NOT NULL,
	`notes` text,
	`estimatedCost` decimal(10,2) NOT NULL DEFAULT '0',
	`position` int NOT NULL DEFAULT 0,
	CONSTRAINT `gt_itinerary_item_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gt_trip_share` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`shareCode` varchar(32) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gt_trip_share_id` PRIMARY KEY(`id`),
	CONSTRAINT `gt_trip_share_shareCode_unique` UNIQUE(`shareCode`)
);
--> statement-breakpoint
CREATE TABLE `gt_trip_stop` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`destinationId` int,
	`city` varchar(120) NOT NULL,
	`country` varchar(120) NOT NULL,
	`latitude` decimal(10,7) NOT NULL,
	`longitude` decimal(10,7) NOT NULL,
	`arrivalDate` date,
	`departureDate` date,
	`position` int NOT NULL DEFAULT 0,
	CONSTRAINT `gt_trip_stop_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gt_trip` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`description` text,
	`startDate` date NOT NULL,
	`endDate` date NOT NULL,
	`travelers` int NOT NULL DEFAULT 1,
	`budget` decimal(10,2) NOT NULL DEFAULT '0',
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`preferences` text,
	`visibility` enum('private','friends','public') NOT NULL DEFAULT 'private',
	`coverImage` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gt_trip_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gt_user_preference` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`travelStyle` text,
	`budgetStyle` varchar(60),
	`favoriteCategories` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gt_user_preference_id` PRIMARY KEY(`id`),
	CONSTRAINT `gt_user_preference_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `gt_activity` ADD CONSTRAINT `gt_activity_destinationId_gt_destination_id_fk` FOREIGN KEY (`destinationId`) REFERENCES `gt_destination`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gt_expense` ADD CONSTRAINT `gt_expense_tripId_gt_trip_id_fk` FOREIGN KEY (`tripId`) REFERENCES `gt_trip`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gt_favorite` ADD CONSTRAINT `gt_favorite_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gt_favorite` ADD CONSTRAINT `gt_favorite_destinationId_gt_destination_id_fk` FOREIGN KEY (`destinationId`) REFERENCES `gt_destination`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gt_itinerary_item` ADD CONSTRAINT `gt_itinerary_item_tripId_gt_trip_id_fk` FOREIGN KEY (`tripId`) REFERENCES `gt_trip`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gt_itinerary_item` ADD CONSTRAINT `gt_itinerary_item_stopId_gt_trip_stop_id_fk` FOREIGN KEY (`stopId`) REFERENCES `gt_trip_stop`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gt_trip_share` ADD CONSTRAINT `gt_trip_share_tripId_gt_trip_id_fk` FOREIGN KEY (`tripId`) REFERENCES `gt_trip`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gt_trip_stop` ADD CONSTRAINT `gt_trip_stop_tripId_gt_trip_id_fk` FOREIGN KEY (`tripId`) REFERENCES `gt_trip`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gt_trip_stop` ADD CONSTRAINT `gt_trip_stop_destinationId_gt_destination_id_fk` FOREIGN KEY (`destinationId`) REFERENCES `gt_destination`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gt_trip` ADD CONSTRAINT `gt_trip_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gt_user_preference` ADD CONSTRAINT `gt_user_preference_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;