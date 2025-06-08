import { friendRequestsTable, userTable } from "../db.js";
import logger from "../logger.js";

export async function up(knex) {
	await knex.schema.createTable(friendRequestsTable, (table) => {
		table.increments("id").primary();
		table.integer("sender").notNullable();
		table.integer("receiver").notNullable();

		table.foreign("sender").references("id").inTable(userTable).onDelete("CASCADE");
		table.foreign("receiver").references("id").inTable(userTable).onDelete("CASCADE");
		table.unique(["sender", "receiver"]);
		table.timestamps(true, true, true);
	});

	logger.info("Migration 0009_friend_requests completed");
}

export async function down(knex) {
	await knex.schema.dropTableIfExists(friendRequestsTable);

	logger.info("Migration 0009_friend_requests reverted");
}
