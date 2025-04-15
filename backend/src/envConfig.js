import "./loadEnv.js";
import logger from "./logger.js";

let env = process.env.ENV;

if (!env) {
	logger.warn("Unable to find current environment. Defaulting to 'development'");
	env = "development";
}

const devConfig = {};

const prodConfig = {};

const configs = {
	development: devConfig,
	production: prodConfig,
};

const envConfig = configs[env];

export default envConfig;
