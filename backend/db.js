import "./loadEnv.js";
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
                table.string("email").notNullable().unique();
                table.string("firstName").notNullable();
                table.string("lastName").notNullable();
                table.string("password").notNullable();
                table.integer("role").notNullable();
                table.timestamps(true, true);
            });

            logger.info("Database initiated.");
        } catch (error) {
            logger.error(error.message);
        }
    },

    populate: async () => {
        await dbClient(userTable).insert({
            email: "admin@mail.com",
            firstName: "Admin",
            lastName: "Adminsson",
            password: "$2b$10$VBOsAZiw9kVAjdixWVSD9.cRMbttIjulDWlWRQJh0j2L6YPJS5G/i",
            role: userRoles.ADMIN,
        });

        await dbClient(userTable).insert({
            email: "user@mail.com",
            firstName: "User",
            lastName: "Usersson",
            password: "$2b$10$nxeNYaYGG0wtb5gDyok29ekEIOeT6t0UjQTy6hpexL2lv/3EQAADq",
            role: userRoles.USER,
        });
    },

    user: {
        add: async (email, firstName, lastName, plaintextPassword, role) => {
            const hashedPassword = await generatePassword(plaintextPassword);

            return (await dbClient(userTable)
                .insert({
                    email,
                    firstName,
                    lastName,
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

        getByEmail: async (email) => {
            return (await dbClient(userTable)
                .select("*")
                .where({ email })
                .first()
            );
        },

        getAll: async () => {
            return (await dbClient(userTable)
                .select("id", "email", "firstName", "lastName", "created_at")
            );
        },

        exists: async (email) => {
            const res = await dbClient(userTable)
                .select("id")
                .where({ email });  

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