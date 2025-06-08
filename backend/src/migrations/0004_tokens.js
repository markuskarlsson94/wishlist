import { tokenTable, userTable } from "../db.js";
import logger from "../logger.js";

export async function up(knex) {
	await knex.schema.createTable(tokenTable, (table) => {
		table.increments("id").primary();
		table.integer("user").notNullable().unique();
		table.string("token").notNullable();

		table.foreign("user").references("id").inTable(userTable).onDelete("CASCADE");
	});

	logger.info("Migration 0004_tokens completed");
}

export async function down(knex) {
	await knex.schema.dropTableIfExists(tokenTable);

	logger.info("Migration 0004_tokens completed");
}
