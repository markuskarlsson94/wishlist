import { notificationTable, reservationsTable } from "../db.js";
import logger from "../logger.js";

export async function up(knex) {
	await knex.schema.table(notificationTable, (table) => {
		table.integer("reservation").unique();
		table.foreign("reservation").references("id").inTable(reservationsTable).onDelete("CASCADE");
	});

	logger.info("Migration 0017_notifications_reservation_column completed");
}

export async function down(knex) {
	await knex.schema.table(notificationTable, (table) => {
		table.dropColumn("reservation");
	});

	logger.info("Migration 0017_notifications_reservation_column reverted");
}
