import "./loadEnv.js";
import logger from "./logger.js";
import knex from "knex";
import config from "./knexfile.js";

let env = process.env.ENV;

if (!env) {
	env = "development";
	logger.warn(`Unable to find current environment. Defaulting to '${env}'`);
}

logger.info(`Environment: ${env}`);

const baseConfig = {
	getDBClient: () => {
		const dbClient = knex(config[env]);
		logger.info("Connected to database");
		return dbClient;
	},
	isProd: () => {
		return false;
	},
};

const devConfig = {
	...baseConfig,
	getFrontendUrl: () => {
		return `${process.env.VITE_API_URL}:${process.env.FRONTEND_PORT}`;
	},
	getGoogleCallbackUrl: () => {
		return `${process.env.VITE_API_URL}:${process.env.VITE_BACKEND_PORT}/api/v1/auth/google/callback`;
	},
};

const prodConfig = {
	...baseConfig,
	getFrontendUrl: () => {
		return `${process.env.VITE_APP_DOMAIN}`;
	},
	getGoogleCallbackUrl: () => {
		return `${process.env.RENDER_EXTERNAL_URL}/api/v1/auth/google/callback`;
	},
	isProd: () => {
		return true;
	},
};

const configs = {
	development: devConfig,
	production: prodConfig,
};

const envConfig = configs[env];

export default envConfig;
