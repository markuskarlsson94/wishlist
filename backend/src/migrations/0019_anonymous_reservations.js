import { reservationsTable } from "../db.js";
import logger from "../logger.js";

export async function up(knex) {
	await knex.schema.table(reservationsTable, (table) => {
		table.boolean("isAnonymous").defaultTo(false);
	});

	logger.info("Migration 0019_anonymous_reservations completed");
}

export async function down(knex) {
	await knex.schema.table(reservationsTable, (table) => {
		table.dropColumn("isAnonymous");
	});

	logger.info("Migration 0019_anonymous_reservations reverted");
}
