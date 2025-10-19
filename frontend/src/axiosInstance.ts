import axios from "axios";
import { StatusCodes } from "http-status-codes";
import envConfig from "./envConfig";

let isRefreshing: boolean = false;
let requestQueue: Array<(error?: any) => void> = [];
const baseURL = envConfig.getBackendUrl();

const axiosInstance = axios.create({
	baseURL,
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

		if (
			error.response.status === StatusCodes.UNAUTHORIZED &&
			!originalRequest._retry &&
			!originalRequest.url.includes("/auth/login")
		) {
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
			} catch (err: any) {
				requestQueue.forEach((callback) => callback(Promise.reject(err)));
				requestQueue = [];

				if (err?.response?.status === StatusCodes.UNAUTHORIZED) {
					window.location.href = "/";
					localStorage.removeItem("accessToken");
					localStorage.removeItem("refreshToken");
				}

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
		// TODO: using axiosInstance when the refresh token has expired does not navigate the user back to the homepage. Investiage why
		const res = await axios.post(`${baseURL}/auth/refresh`, {
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
