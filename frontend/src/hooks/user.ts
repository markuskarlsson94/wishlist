import { QueryClient, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import UserType from "../types/UserType";
import { AxiosError } from "axios";
import { StatusCodes } from "http-status-codes";

type CurrentUserResponse = {
	data: {
		user: {
			id: number;
			isAdmin: boolean;
		};
	};
};

export const useCurrentUser = () => {
	const { data, ...rest } = useQuery<CurrentUserResponse>({
		queryKey: ["user"],
		queryFn: () => axiosInstance.get("/auth/me"),
	});

	return { user: data?.data.user, ...rest };
};

type UserResponse = {
	data: {
		user: UserType;
	};
};

export const useGetUser = (id: number | undefined) => {
	const { data, error, ...rest } = useQuery<UserResponse>({
		queryKey: ["user", id],
		queryFn: () => axiosInstance.get(`/user/${id}`),
		enabled: !!id,
	});

	const notFound = error?.response?.status === StatusCodes.NOT_FOUND;

	return {
		user: data?.data.user,
		notFound,
		...rest,
	};
};

type UserPage = {
	data: {
		users: any[];
		nextPage?: number;
	};
};

type UseUpdateNameConfig = {
	onSuccess?: () => void;
	onError?: (error: AxiosError) => void;
};

export const useUpdateName = (config?: UseUpdateNameConfig) => {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: async ({ id, firstName, lastName }: { id: number; firstName: string; lastName: string }) => {
			await axiosInstance.post(`/user/update-name`, {
				firstName,
				lastName,
			});

			invalidateUser(queryClient, id);
		},
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

	const updateName = (id: number, firstName: string, lastName: string) => {
		mutation.mutate({ id, firstName, lastName });
	};

	return updateName;
};

export const useSearchUser = (query: string) => {
	const { data, isFetching, isSuccess, hasNextPage, fetchNextPage } = useInfiniteQuery<UserPage>({
		queryKey: ["userSearch", query],
		queryFn: ({ pageParam }) => axiosInstance.get(`/user/search?query=${query}&page=${pageParam}`),
		initialPageParam: 0,
		getNextPageParam: (lastPage, _allPages, _lastPageParam, _allPagesParams) => lastPage.data.nextPage,
		enabled: query.length >= 3,
	});

	const users = data ? data.pages.flatMap((p) => p.data.users) : [];

	return {
		users,
		isFetching,
		isSuccess,
		hasNextPage,
		fetchNextPage,
	};
};

type UseDeleteUserConfig = {
	onSuccess?: () => void;
	onError?: (error: AxiosError) => void;
};

export const useDeleteUser = (config?: UseDeleteUserConfig) => {
	const mutation = useMutation({
		mutationFn: (id: number) => axiosInstance.delete(`/user/${id}`),
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

	const deleteUser = (id: number) => {
		mutation.mutate(id);
	};

	return deleteUser;
};

const userQueryKey = (id: number) => {
	return ["user", id];
};

const invalidateUser = (queryClient: QueryClient, userId: number) => {
	queryClient.invalidateQueries({ queryKey: userQueryKey(userId) });
};
