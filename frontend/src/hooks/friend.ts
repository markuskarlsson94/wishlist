import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import FriendType from "@/types/FriendType";

type FriendResponse = {
	data: {
		friends: FriendType[];
	};
};

export const useGetFriends = (userId: number | undefined) => {
	const { data, isSuccess } = useQuery<FriendResponse>({
		queryKey: friendsQueryKey(userId),
		queryFn: () => axiosInstance.get(`/user/${userId}/friends`),
		enabled: !!userId,
	});

	const friends = data?.data.friends || [];

	return {
		friends,
		isSuccess,
	};
};

type UseDeleteFriendConfig = {
	userId: number | undefined;
	onSuccess?: () => void;
	onError?: (error: Error) => void;
};

export const useDeleteFriend = (config?: UseDeleteFriendConfig) => {
	const queryClient = useQueryClient();

	const deleteFriendFn = async (userId: number) => {
		await axiosInstance.delete(`user/friend/${userId}`);

		queryClient.invalidateQueries({ queryKey: ["friends", config?.userId] });
	};

	const deleteFriendMutation = useMutation({
		mutationFn: deleteFriendFn,
	});

	const deleteFriend = (userId: number) => {
		deleteFriendMutation.mutate(userId);
	};

	return deleteFriend;
};

const friendsQueryKey = (userId: number | undefined) => {
	return ["friends", userId];
};

export const invalidateFriends = (queryClient: QueryClient, userId: number | undefined) => {
	queryClient.invalidateQueries({ queryKey: friendsQueryKey(userId) });
};
