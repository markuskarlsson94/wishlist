import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
const config = {
	development: {
		client: "pg",
		connection: {
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_DATABASE,
			port: process.env.DB_PORT,
		},
		migrations: {
			directory: path.resolve(dirname, "migrations"),
		},
	},
	test: {
		client: "pg",
		connection: {
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			//database: process.env.DB_DATABASE_TEST,
			database: process.env.DB_DATABASE, // TODO: Connect to test database.
			port: process.env.DB_PORT,
		},
		migrations: {
			directory: path.resolve(dirname, "migrations"),
		},
	},
	production: {
		client: "pg",
		connection: {
			host: `db.${process.env.SUPABASE_PROJECT}.supabase.co`,
			user: process.env.SUPABASE_DB_USER,
			password: process.env.SUPABASE_DB_PASSWORD,
			database: process.env.SUPABASE_DB,
			port: process.env.SUPABASE_PORT,
		},
		migrations: {
			directory: path.resolve(dirname, "migrations"),
		},
	},
};

export default config;
