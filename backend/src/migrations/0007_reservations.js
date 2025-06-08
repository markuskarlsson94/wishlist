import { reservationsTable, userTable, wishlistItemTable } from "../db.js";
import logger from "../logger.js";

export async function up(knex) {
	await knex.schema.createTable(reservationsTable, (table) => {
		table.increments("id").primary();
		table.integer("user").notNullable();
		table.integer("item").notNullable();
		table.integer("amount").notNullable();

		table.foreign("user").references("id").inTable(userTable).onDelete("CASCADE");
		table.foreign("item").references("id").inTable(wishlistItemTable).onDelete("CASCADE");
		table.unique(["user", "item"]);
		table.timestamps(true, true, true);
	});

	logger.info("Migration 0007_reservations completed");
}

export async function down(knex) {
	await knex.schema.dropTableIfExists(reservationsTable);

	logger.info("Migration 0007_reservations reverted");
}
