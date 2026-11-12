import { wishlistItemTable } from "../db.js";
import logger from "../logger.js";

export async function up(knex) {
	await knex.schema.table(wishlistItemTable, (table) => {
		table.string("image").nullable();
	});

	logger.info("Migration 0021_item_images completed");
}

export async function down(knex) {
	await knex.schema.table(wishlistItemTable, (table) => {
		table.dropColumn("image");
	});

	logger.info("Migration 0021_item_images reverted");
}
