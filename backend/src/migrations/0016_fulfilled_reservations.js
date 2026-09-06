import { reservationsTable } from "../db.js";
import logger from "../logger.js";

export async function up(knex) {
	await knex.schema.table(reservationsTable, (table) => {
		table.boolean("fulfilled").defaultTo(false);
	});

	logger.info("Migration 0016_fulfilled_reservations completed");
}

export async function down(knex) {
	await knex.schema.table(reservationsTable, (table) => {
		table.dropColumn("fulfilled");
	});

	logger.info("Migration 0016_fulfilled_reservations reverted");
}
