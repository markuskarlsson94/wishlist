import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
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

type UserPage = {
	data: {
		users: any[];
		nextPage?: number;
	};
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
