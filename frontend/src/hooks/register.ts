import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import RegisterInputType from "../types/RegisterInputType";
import { AxiosError } from "axios";

type UseRegisterConfig = {
	onSuccess?: () => void;
	onError?: (error: AxiosError) => void;
};

const useRegister = (config?: UseRegisterConfig) => {
	const registerFn = (input: RegisterInputType) => {
		return axiosInstance.post("/user/register", input);
	};

	const registerMutation = useMutation({
		mutationFn: registerFn,
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

	const register = (input: RegisterInputType) => {
		registerMutation.mutate(input);
	};

	return register;
};

export default useRegister;
