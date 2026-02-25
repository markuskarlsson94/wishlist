import { friendRequestsTable, notificationTable, notificationTypeTable, userTable, wishlistItemTable } from "../db.js";
import logger from "../logger.js";

export async function up(knex) {
	await knex.schema.createTable(notificationTable, (table) => {
		table.increments("id").primary();
		table.integer("user").notNullable();
		table.integer("type").notNullable();
		table.integer("friendRequest");
		table.integer("item");

		table.foreign("user").references("id").inTable(userTable).onDelete("CASCADE");
		table.foreign("type").references("id").inTable(notificationTypeTable);
		table.foreign("friendRequest").references("id").inTable(friendRequestsTable).onDelete("CASCADE");
		table.foreign("item").references("id").inTable(wishlistItemTable).onDelete("CASCADE");

		table.timestamps(true, true, true);
	});

	logger.info("Migration 0015_notifications completed");
}

export async function down(knex) {
	await knex.schema.dropTableIfExists(notificationTable);

	logger.info("Migration 0015_notifications reverted");
}
