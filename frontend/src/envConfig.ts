let env: keyof typeof configs = import.meta.env.MODE as keyof typeof configs;

if (!env) {
	console.warn("Unable to find current environment. Defaulting to 'development'");
	env = "development";
}

type ConfigType = {
	getBackendUrl: () => string;
};

const devConfig: ConfigType = {
	getBackendUrl: () => {
		return `${import.meta.env.VITE_API_URL}:${import.meta.env.VITE_BACKEND_PORT}/api/v1`;
	},
};

const prodConfig: ConfigType = {
	getBackendUrl: () => {
		return `https://${import.meta.env.VITE_API_URL}.onrender.com/api/v1`;
	},
};

const configs = {
	development: devConfig,
	production: prodConfig,
};

const envConfig: ConfigType = configs[env];

export default envConfig;
