import { userRolesTable } from "../db.js";
import logger from "../logger.js";

export async function up(knex) {
	await knex.schema.createTable(userRolesTable, (table) => {
		table.increments("id").primary();
		table.string("name").notNullable().unique();
	});

	await knex(userRolesTable).insert([{ name: "admin" }, { name: "user" }]);

	logger.info("Migration 0001_user_roles completed");
}

export async function down(knex) {
	await knex.schema.dropTable(userRolesTable);

	logger.info("Migration 0001_user_roles reverted");
}
