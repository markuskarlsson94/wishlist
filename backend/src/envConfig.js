import "./loadEnv.js";
import logger from "./logger.js";

let env = process.env.ENV;

if (!env) {
	logger.warn("Unable to find current environment. Defaulting to 'development'");
	env = "development";
}

const devConfig = {
	getFrontendUrl: () => {
		return `${process.env.API_URL}:${process.env.FRONTEND_PORT}`;
	},
};

const prodConfig = {
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
