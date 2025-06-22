import "./loadEnv.js";
import logger from "./logger.js";
import knex from "knex";
import config from "./knexfile.js";

let env = process.env.ENV;

if (!env) {
	logger.warn("Unable to find current environment. Defaulting to 'development'");
	env = "development";
}

const baseConfig = {
	getDBClient: () => {
		const dbClient = knex(config[env]);
		logger.info("Connected to database");
		return dbClient;
	},
};

const devConfig = {
	...baseConfig,
	getFrontendUrl: () => {
		return `${process.env.API_URL}:${process.env.FRONTEND_PORT}`;
	},
};

const prodConfig = {
	...baseConfig,
	getFrontendUrl: () => {
		return `${process.env.VITE_APP_DOMAIN}`;
	},
};

const configs = {
	development: devConfig,
	production: prodConfig,
};

const envConfig = configs[env];

export default envConfig;
