import knex from "knex";
import config from "./knexfile.js";
import logger from "./logger.js";
import userRoles from "./roles.js";
import { generatePassword } from "./utilities/password.js";

const environment = process.env.NODE_ENV || 'development';
const userTable = "users";
let dbClient;

const db = {
    connect: async () => {
        try {
            dbClient = knex(config[environment]);
            logger.info("Connected to database.");
        } catch (error) {
            logger.error("Error connecting to database:", error);
        }
    },

    disconnect: async () => {
        try {
            await dbClient.destroy();
            logger.info('Disconnected from database');
        } catch (error) {
            logger.error('Error disconnecting from database', error);
        }
    },

    init: async () => {
        try {
            await dbClient.schema.dropTableIfExists(userTable);
            
            await dbClient.schema.createTable(userTable, (table) => {
                table.increments("id").primary();
                table.string("username").notNullable().unique();
                table.string("email").notNullable().unique();
                table.string("password");
                table.integer("role");
                table.timestamps(true, true);
            });

            await dbClient(userTable).insert({
                username: "admin",
                email: "admin@mail.com",
                password: "$2b$10$VBOsAZiw9kVAjdixWVSD9.cRMbttIjulDWlWRQJh0j2L6YPJS5G/i",
                role: userRoles.ADMIN,
            });

            await dbClient(userTable).insert({
                username: "customer",
                email: "customer@mail.com",
                password: "$2b$10$nxeNYaYGG0wtb5gDyok29ekEIOeT6t0UjQTy6hpexL2lv/3EQAADq",
                role: userRoles.CUSTOMER,
            });

            logger.info("Database initiated.");
        } catch (error) {
            logger.error(error.message);
        }
    },

    user: {
        add: async (username, email, plaintextPassword, role) => {
            const hashedPassword = await generatePassword(plaintextPassword);

            return (await dbClient(userTable)
                .insert({ 
                    username,
                    email,
                    password: hashedPassword,
                    role,
                })
                .returning("id")
            )[0].id;
        },

        remove: async (id) => {
            await dbClient(userTable)
                .delete()
                .where({ id });
        },

        getById: async (id) => {
            return (await dbClient(userTable)
                .select("*")
                .where({ id })
                .first()
            );
        },
        
        getByUsername: async (username) => {
            return (await dbClient(userTable)
                .select("*")
                .where({ username })
                .first()
            );
        },

        getAll: async () => {
            return (await dbClient(userTable)
                .select("id", "username", "email", "created_at")
            );
        },

        exists: async (username, email) => {
            const res = await dbClient(userTable)
                .select("id")
                .where({ username })
                .orWhere({ email });

            return res.length > 0;
        },

        updatePassword: async (id, plaintextPassword) => {
            const hashedPassword = await generatePassword(plaintextPassword);

            await dbClient(userTable)
                .update({ password: hashedPassword })
                .where({ id });
        },
    }
};

export default db;