import { notificationTypeTable } from "../db.js";
import logger from "../logger.js";

export async function up(knex) {
	await knex.schema.createTable(notificationTypeTable, (table) => {
		table.increments("id").primary();
		table.string("name").notNullable().unique();
	});

	await knex(notificationTypeTable).insert([{ name: "friendRequest" }, { name: "comment" }]);

	logger.info("Migration 0014_notification_types completed");
}

export async function down(knex) {
	await knex.schema.dropTableIfExists(notificationTypeTable);

	logger.info("Migration 0014_notification_types reverted");
}
