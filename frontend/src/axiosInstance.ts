import axios from "axios";

let isRefreshing: boolean = false;
let requestQueue: Array<(error?: any) => void> = [];

const isProduction = import.meta.env.prod;
const axiosInstance = axios.create({
	baseURL: isProduction
		? import.meta.env.VITE_API_URL
		: `${import.meta.env.VITE_API_URL}:${import.meta.env.VITE_BACKEND_PORT}/api/v1`,
});

axiosInstance.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("accessToken");

		if (token) {
			config.headers["Authorization"] = `Bearer ${token}`;
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

axiosInstance.interceptors.response.use(
	(response) => {
		return response;
	},
	async (error) => {
		const originalRequest = error.config;

		if (error.response.status === 401 && !originalRequest._retry) {
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					requestQueue.push(() => {
						originalRequest._retry = true;
						axiosInstance(originalRequest).then(resolve).catch(reject);
					});
				});
			}

			isRefreshing = true;
			originalRequest._retry = true;

			try {
				await refreshAccessToken();

				requestQueue.forEach((callback) => callback());
				requestQueue = [];
				return axiosInstance(originalRequest);
			} catch (err) {
				requestQueue.forEach((callback) => callback(Promise.reject(err)));
				requestQueue = [];
				return Promise.reject(err);
			} finally {
				isRefreshing = false;
			}
		}

		return Promise.reject(error);
	},
);

const refreshAccessToken = async () => {
	const refreshToken = localStorage.getItem("refreshToken");

	if (refreshToken) {
		const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/auth/refresh`, {
			refreshToken,
		});

		const accessToken = res?.data.accessToken;

		localStorage.setItem("accessToken", accessToken);
		localStorage.setItem("refreshToken", res?.data.refreshToken);

		axiosInstance.defaults.headers["Authorization"] = `Bearer ${accessToken}`;
	} else {
		return Promise.reject("Refresh token not found.");
	}
};

export default axiosInstance;
