import { waitlistTable } from "../db.js";
import logger from "../logger.js";

export async function up(knex) {
	await knex.schema.createTable(waitlistTable, (table) => {
		table.increments("id").primary();
		table.string("email").notNullable();
		table.string("firstName").notNullable();
		table.string("lastName").notNullable();
		table.string("password").notNullable();
		table.integer("role").notNullable();
		table.string("profilePicture");
		table.string("token").notNullable();

		table.timestamps(true, true, true);
	});

	logger.info("Migration 0011_waitlist completed");
}

export async function down(knex) {
	await knex.schema.dropTableIfExists(waitlistTable);

	logger.info("Migration 0011_waitlist reverted");
}
