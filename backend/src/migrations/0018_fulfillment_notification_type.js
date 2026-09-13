import { notificationTypeTable } from "../db.js";
import logger from "../logger.js";

export async function up(knex) {
	await knex(notificationTypeTable).insert({ name: "fulfillment" });

	logger.info("Migration 0018_fulfillment_notification_type completed");
}

export async function down(knex) {
	await knex(notificationTypeTable).where({ name: "fulfillment" }).delete();

	logger.info("Migration 0018_fulfillment_notification_type reverted");
}
