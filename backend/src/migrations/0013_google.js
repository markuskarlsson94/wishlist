import { userTable } from "../db.js";

export async function up(knex) {
	await knex.schema.table(userTable, (table) => {
		table.string("googleId");
		table.setNullable("password");
	});
}

export async function down(knex) {
	await knex.schema.table(userTable, (table) => {
		table.dropColumn("googleId");
		table.dropNullable("password");
	});
}
