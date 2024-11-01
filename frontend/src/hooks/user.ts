import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import UserType from "../types/UserType";

type CurrentUserResponse = {
	data: {
		id: number;
	};
};

export const useCurrentUser = () => {
	const { data, ...rest } = useQuery<CurrentUserResponse>({
		queryKey: ["user"],
		queryFn: () => axiosInstance.get("/auth/me"),
	});

	return { user: data?.data.id, ...rest };
};

type UserResponse = {
	data: {
		user: UserType;
	};
};

export const useGetUser = (id: number | undefined) => {
	const { data, isSuccess } = useQuery<UserResponse>({
		queryKey: ["user", id],
		queryFn: () => axiosInstance.get(`/user/${id}`),
		enabled: !!id,
	});

	return {
		user: data?.data.user,
		isSuccess,
	};
};
