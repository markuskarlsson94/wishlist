import { invitesTable, userTable, wishlistTable } from "../db.js";
import logger from "../logger.js";

export async function up(knex) {
	await knex.schema.createTable(invitesTable, (table) => {
		table.increments("id").primary();
		table.integer("wishlist").notNullable();
		table.integer("user").notNullable();

		table.foreign("wishlist").references("id").inTable(wishlistTable).onDelete("CASCADE");
		table.foreign("user").references("id").inTable(userTable).onDelete("CASCADE");

		table.unique(["wishlist", "user"]);
		table.timestamps(true, true, true);
	});

	logger.info("Migration 0020_invites completed");
}

export async function down(knex) {
	await knex.schema.dropTableIfExists(invitesTable);

	logger.info("Migration 0020_invites reverted");
}
