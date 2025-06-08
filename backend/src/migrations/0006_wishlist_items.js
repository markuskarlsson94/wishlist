import { wishlistItemTable, wishlistTable } from "../db.js";
import logger from "../logger.js";

export async function up(knex) {
	await knex.schema.createTable(wishlistItemTable, (table) => {
		table.increments("id").primary();
		table.integer("wishlist").notNullable();
		table.string("title").notNullable();
		table.string("description").notNullable();
		table.string("link");
		table.integer("amount").notNullable();

		table.foreign("wishlist").references("id").inTable(wishlistTable).onDelete("CASCADE");
		table.timestamps(true, true, true);
	});

	logger.info("Migration 0006_wishlist_items completed");
}

export async function down(knex) {
	await knex.schema.dropTableIfExists(wishlistItemTable);

	logger.info("Migration 0006_wishlist_items reverted");
}
