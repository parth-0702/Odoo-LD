ALTER TABLE `gt_favorite` ADD CONSTRAINT `favorite_user_destination_unq` UNIQUE(`userId`,`destinationId`);--> statement-breakpoint
CREATE INDEX `activity_destination_idx` ON `gt_activity` (`destinationId`);--> statement-breakpoint
CREATE INDEX `destination_region_cost_idx` ON `gt_destination` (`region`,`costIndex`);--> statement-breakpoint
CREATE INDEX `expense_trip_created_idx` ON `gt_expense` (`tripId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `itinerary_trip_date_position_idx` ON `gt_itinerary_item` (`tripId`,`itineraryDate`,`position`);--> statement-breakpoint
CREATE INDEX `trip_stop_trip_position_idx` ON `gt_trip_stop` (`tripId`,`position`);--> statement-breakpoint
CREATE INDEX `trip_owner_updated_idx` ON `gt_trip` (`ownerId`,`updatedAt`);--> statement-breakpoint
CREATE UNIQUE INDEX `favorite_user_destination_unq` ON `gt_favorite` (`userId`,`destinationId`);
