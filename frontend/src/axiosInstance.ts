import axios from 'axios';

let isRefreshing: boolean = false;

const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
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
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response; 
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // TODO: Add request queue.
                return;
            }

            isRefreshing = true;
            originalRequest._retry = true;

            await refreshAccessToken();
            
            return (new Promise((resolve, reject) => {
                try {
                    resolve(axiosInstance(originalRequest));
                } catch (error) {
                    reject(error);
                } finally {
                    isRefreshing = false;
                }
            }));
        }

        return (new Promise((_resolve, reject) => {
            reject("Refresh token not found");
            isRefreshing = false;
        }));
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