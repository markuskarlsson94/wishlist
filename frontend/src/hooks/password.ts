import axiosInstance from "@/axiosInstance";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";

type UseUpdatePasswordConfig = {
	onSuccess?: () => void;
	onError?: (error: AxiosError) => void;
};

export const useUpdatePassword = (config?: UseUpdatePasswordConfig) => {
	const mutation = useMutation({
		mutationFn: ({
			passwordCur,
			passwordNew,
			passwordNewRepeated,
		}: {
			passwordCur: string;
			passwordNew: string;
			passwordNewRepeated: string;
		}) =>
			axiosInstance.post("/user/update-password", {
				passwordCur,
				passwordNew,
				passwordNewRepeated,
			}),
		onSuccess: () => {
			if (config?.onSuccess) {
				config.onSuccess();
			}
		},
		onError: (error: AxiosError) => {
			if (config?.onError) {
				config.onError(error);
			}
		},
	});

	const updatePassword = (passwordCur: string, passwordNew: string, passwordNewRepeated: string) => {
		mutation.mutate({ passwordCur, passwordNew, passwordNewRepeated });
	};

	return updatePassword;
};

type UseRequestPasswordResetConfig = {
	onSuccess?: (email: string) => void;
	onError?: (error: AxiosError) => void;
};

export const useRequestPasswordReset = (config?: UseRequestPasswordResetConfig) => {
	const [sentEmail, setSentEmail] = useState<string>("");

	const mutation = useMutation({
		mutationFn: (email: string) => {
			setSentEmail(email);

			return axiosInstance.post("/user/request-password-reset", {
				email,
			});
		},
		onSuccess: () => {
			if (config?.onSuccess) {
				config.onSuccess(sentEmail);
			}
		},
		onError: (error: AxiosError) => {
			if (config?.onError) {
				config.onError(error);
			}
		},
	});

	const requestPasswordReset = (email: string) => {
		mutation.mutate(email);
	};

	return requestPasswordReset;
};

type UsePasswordResetConfig = {
	onSuccess?: () => void;
	onError?: (error: AxiosError) => void;
};

export const useResetPassword = (config?: UsePasswordResetConfig) => {
	const mutation = useMutation({
		mutationFn: ({ token, password }: { token: string; password: string }) =>
			axiosInstance.post("/user/reset-password", {
				token,
				password,
			}),
		onSuccess: () => {
			if (config?.onSuccess) {
				config.onSuccess();
			}
		},
		onError: (error: AxiosError) => {
			if (config?.onError) {
				config.onError(error);
			}
		},
	});

	const resetPassword = (token: string, password: string) => {
		mutation.mutate({ token, password });
	};

	return { resetPassword, ...mutation };
};
