import { userTable } from "../db.js";
import logger from "../logger.js";

export async function up(knex) {
	await knex.schema.table(userTable, (table) => {
		table.string("googleId");
		table.setNullable("password");
	});

	logger.info("Migration 0013_google completed");
}

export async function down(knex) {
	await knex.schema.table(userTable, (table) => {
		table.dropColumn("googleId");
		table.dropNullable("password");
	});

	logger.info("Migration 0013_google reverted");
}
