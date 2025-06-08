import { wishlistTable, userTable, wishlistTypeTable } from "../db.js";
import logger from "../logger.js";

export async function up(knex) {
	await knex.schema.createTable(wishlistTable, (table) => {
		table.increments("id").primary();
		table.integer("owner").notNullable();
		table.string("title").notNullable();
		table.string("description");
		table.integer("type").notNullable();

		table.foreign("owner").references("id").inTable(userTable).onDelete("CASCADE");
		table.foreign("type").references("id").inTable(wishlistTypeTable);
		table.timestamps(true, true, true);
	});

	logger.info("Migration 0005_wishlists completed");
}

export async function down(knex) {
	await knex.schema.dropTableIfExists(wishlistTable);

	logger.info("Migration 0005_wishlists reverted");
}
