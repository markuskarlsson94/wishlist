import { wishlistTypeTable } from "../db.js";
import logger from "../logger.js";

export async function up(knex) {
	await knex.schema.createTable(wishlistTypeTable, (table) => {
		table.increments("id").primary();
		table.string("name").notNullable().unique();
	});

	await knex(wishlistTypeTable).insert([
		{ name: "public" },
		{ name: "friends" },
		{ name: "invite" },
		{ name: "hidden" },
	]);

	logger.info("Migration 0002_wishlist_types completed");
}

export async function down(knex) {
	await knex.schema.dropTableIfExists(wishlistTypeTable);

	logger.info("Migration 0002_wishlist_types reverted");
}
