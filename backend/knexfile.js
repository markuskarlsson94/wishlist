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
        }
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
        }
    }
};

export default config;