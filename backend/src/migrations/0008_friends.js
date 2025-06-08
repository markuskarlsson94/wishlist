import { friendsTable, userTable } from "../db.js";
import logger from "../logger.js";

export async function up(knex) {
	await knex.schema.createTable(friendsTable, (table) => {
		table.increments("id").primary();
		table.integer("user1").notNullable();
		table.integer("user2").notNullable();

		table.foreign("user1").references("id").inTable(userTable).onDelete("CASCADE");
		table.foreign("user2").references("id").inTable(userTable).onDelete("CASCADE");
		table.unique(["user1", "user2"]);
		table.timestamps(true, true, true);
	});

	logger.info("Migration 0008_friends completed");
}

export async function down(knex) {
	await knex.schema.dropTableIfExists(friendsTable);

	logger.info("Migration 0008_friends reverted");
}
