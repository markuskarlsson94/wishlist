import { userTable, userRolesTable } from "../db.js";
import logger from "../logger.js";

export async function up(knex) {
	await knex.schema.createTable(userTable, (table) => {
		table.increments("id").primary();
		table.string("email").notNullable().unique();
		table.string("firstName").notNullable();
		table.string("lastName").notNullable();
		table.string("password").notNullable();
		table.integer("role").notNullable();
		table.string("profilePicture").defaultTo(null);

		table.foreign("role").references("id").inTable(userRolesTable);
		table.timestamps(true, true, true);
	});

	logger.info("Migration 0003_users completed");
}

export async function down(knex) {
	await knex.schema.dropTableIfExists(userTable);

	logger.info("Migration 0003_users reverted");
}
