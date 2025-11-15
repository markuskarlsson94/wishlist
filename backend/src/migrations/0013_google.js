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
	await knex.table(userTable).update({ password: "PREVIOUSLY NULL" }).whereNull("password");

	await knex.schema.table(userTable, (table) => {
		table.dropColumn("googleId");
		table.dropNullable("password");
	});

	logger.info("Migration 0013_google reverted");
}
