import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import { useAuth } from "../contexts/AuthContext";

type UseLogoutConfig = {
    onSuccess?: () => void,
    onError?: (error: Error) => void,
};

const logout = async (userId: number): Promise<void> => {
    return (await axiosInstance.post("/auth/logout", {
        userId,
    }));
}

export const useLogout = (config?: UseLogoutConfig) => {
    const { setIsAuthenticated, userId, setUserId } = useAuth();

    const mutation = useMutation({
        mutationFn: () => logout(userId!),
        onSuccess: () => {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            setIsAuthenticated(false);
            setUserId(undefined);

            if (config?.onSuccess) {
                config.onSuccess();
            }
        },
        onError: (error: Error) => {
            console.error("Logout failed:", error);

            if (config?.onError) {
                config.onError(error);
            }
        },
    });

    return { logout: mutation.mutate, ...mutation };
};