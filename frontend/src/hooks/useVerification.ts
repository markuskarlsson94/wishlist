import axiosInstance from "@/axiosInstance";
import { AxiosResponse } from "axios";
import { useMutation } from "@tanstack/react-query";

type VerificationResponse = {
	message: string;
};

const verify = async ({ token }: { token: string }): Promise<VerificationResponse> => {
	const res: AxiosResponse<VerificationResponse> = await axiosInstance.post(`/auth/verify?token=${token}`);
	return res.data;
};

export const useVerification = () => {
	const mutation = useMutation({
		mutationFn: verify,
	});

	return { verify: mutation.mutate, ...mutation };
};
