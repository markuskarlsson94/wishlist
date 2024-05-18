import knex from "knex";
import config from "./knexfile.js";

const environment = process.env.NODE_ENV || 'development';
let dbClient;

const db = {
    connect: async () => {
        try {
            dbClient = knex(config[environment]);
            console.log("Connected to database.");
        } catch (error) {
            console.log("Error connecting to database:", error);
        }
    },

    disconnect: async () => {
        try {
            await dbClient.destroy();
            console.log('Disconnected from database');
        } catch (error) {
            console.error('Error disconnecting from database', error);
        }
    },
};

export default db;