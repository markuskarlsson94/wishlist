import { passwordTokenTable, userTable } from "../db.js";
import logger from "../logger.js";

export async function up(knex) {
	await knex.schema.createTable(passwordTokenTable, (table) => {
		table.increments("id").primary();
		table.integer("user").notNullable();
		table.string("token").notNullable();

		table.foreign("user").references("id").inTable(userTable).onDelete("CASCADE");
		table.timestamps(true, true, true);
	});

	logger.info("Migration 0012_password_tokens completed");
}

export async function down(knex) {
	await knex.schema.dropTableIfExists(passwordTokenTable);

	logger.info("Migration 0012_password_tokens completed");
}
