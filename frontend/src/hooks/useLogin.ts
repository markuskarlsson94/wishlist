import { useMutation, UseMutationResult, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import { AxiosResponse } from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useCurrentUser } from "./user";
import { useEffect } from "react";

type LoginCredentials = {
    email: string;
    password: string;
};

type LoginResponse = {
    accessToken: string;
    refreshToken: string;
};

type UseLoginConfig = {
    onSuccess?: (data: LoginResponse) => void;
    onError?: (error: Error) => void;
};

type UseLoginResult = Omit<UseMutationResult<LoginResponse, Error, LoginCredentials, unknown>, 'mutate'> & {
    login: (variables: LoginCredentials) => void;
};

const login = async ({ email, password }: LoginCredentials): Promise<LoginResponse> => {
    const res: AxiosResponse<LoginResponse> = await axiosInstance.post("/auth/login", {
        email,
        password,
    });

    return res.data;
}

export const useLogin = (config?: UseLoginConfig): UseLoginResult => {
    const { setIsAuthenticated, setUserId } = useAuth();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: login,
        onSuccess: (data: LoginResponse) => {
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            setIsAuthenticated(true);

            queryClient.invalidateQueries({ queryKey: ["user"] });

            if (config?.onSuccess) {
                config.onSuccess(data);
            }
        },
        onError: (error: Error) => {
            console.error("Login failed:", error);
            setIsAuthenticated(false);

            if (config?.onError) {
                config.onError(error);
            }
        },
    });

    const { user } = useCurrentUser();

    useEffect(() => {
        if (user) {
            setUserId(user);
        }
    }, [user, setUserId]);

    return { login: mutation.mutate, ...mutation };
};