import { commentsTable, wishlistItemTable, userTable } from "../db.js";
import logger from "../logger.js";

export async function up(knex) {
	await knex.schema.createTable(commentsTable, (table) => {
		table.increments("id").primary();
		table.integer("item").notNullable();
		table.integer("user").notNullable();
		table.string("comment").notNullable();
		table.boolean("asAdmin").notNullable();

		table.foreign("item").references("id").inTable(wishlistItemTable).onDelete("CASCADE");
		table.foreign("user").references("id").inTable(userTable);
		table.timestamps(true, true, true);
	});

	logger.info("Migration 0010_comments completed");
}

export async function down(knex) {
	await knex.schema.dropTableIfExists(commentsTable);

	logger.info("Migration 0010_comments reverted");
}
