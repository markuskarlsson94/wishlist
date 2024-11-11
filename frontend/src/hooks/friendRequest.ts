import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import FriendRequest from "../types/FriendRequesstType";
import { invalidateFriends } from "./friend";

type FriendRequestsResponse = {
	data: {
		requests: FriendRequest[];
	};
};

export const useGetFriendRequests = (id: number | undefined) => {
	const { data: dataSent, isSuccess: isSuccessSent } = useQuery<FriendRequestsResponse>({
		queryKey: sentFriendRequestsQueryKey(id),
		queryFn: () => axiosInstance.get(`/user/${id}/sentfriendrequests`),
		enabled: !!id,
	});

	const { data: dataReceived, isSuccess: isSuccessReceived } = useQuery<FriendRequestsResponse>({
		queryKey: receivedFriendRequestsQueryKey(id),
		queryFn: () => axiosInstance.get(`/user/${id}/receivedfriendrequests`),
		enabled: !!id,
	});

	const sentFriendRequests = dataSent?.data.requests || [];
	const receivedFriendRequests = dataReceived?.data.requests || [];

	return {
		sentFriendRequests,
		receivedFriendRequests,
		isSuccess: isSuccessSent && isSuccessReceived,
	};
};

type UseCreateFriendRequestConfig = {
	userId: number | undefined;
	onSuccess?: () => void;
	onError?: (error: Error) => void;
};

export const useCreateFriendRequest = (config?: UseCreateFriendRequestConfig) => {
	const queryClient = useQueryClient();

	const createFriendRequestFn = async ({ senderId, receiverId }: { senderId: number; receiverId: number }) => {
		if (!config?.userId) return;

		await axiosInstance.post("/user/friendrequest", {
			senderId,
			receiverId,
		});

		invalidateSentFriendRequest(queryClient, senderId);
	};

	const createFriendRequestMutation = useMutation({
		mutationFn: createFriendRequestFn,
		onSuccess: () => {
			if (config?.onSuccess) {
				config.onSuccess();
			}
		},
		onError: (error: Error) => {
			if (config?.onError) {
				config.onError(error);
			}
		},
	});

	const createFriendRequest = (senderId: number, receiverId: number) => {
		createFriendRequestMutation.mutate({ senderId, receiverId });
	};

	return createFriendRequest;
};

type UseDeleteFriendRequestConfig = {
	userId: number | undefined;
	onSuccess?: () => void;
	onError?: (error: Error) => void;
};

export const useDeleteFriendRequest = (config?: UseDeleteFriendRequestConfig) => {
	const queryClient = useQueryClient();

	const deleteFriendRequestFn = async (id: number) => {
		if (!config?.userId) return;

		await axiosInstance.delete(`/user/friendrequest/${id}`);

		invalidateSentFriendRequest(queryClient, config.userId);
		invalidateReceivedFriendRequest(queryClient, config.userId);
	};

	const deleteFriendRequestMutation = useMutation({
		mutationFn: deleteFriendRequestFn,
		onSuccess: () => {
			if (config?.onSuccess) {
				config.onSuccess();
			}
		},
		onError: (error: Error) => {
			if (config?.onError) {
				config.onError(error);
			}
		},
	});

	const deleteFriendRequest = (id: number) => {
		deleteFriendRequestMutation.mutate(id);
	};

	return deleteFriendRequest;
};

type UseAcceptFriendRequestConfig = {
	userId: number | undefined;
	onSuccess?: () => void;
	onError?: (error: Error) => void;
};

export const useAcceptFriendRequest = (config?: UseAcceptFriendRequestConfig) => {
	const queryClient = useQueryClient();

	const acceptFriendRequestFn = async (id: number) => {
		if (!config?.userId) return;

		await axiosInstance.put(`/user/friendrequest/${id}/accept`);
		invalidateReceivedFriendRequest(queryClient, config.userId);
		invalidateFriends(queryClient, config.userId);
	};

	const acceptFriendRequestMutation = useMutation({
		mutationFn: acceptFriendRequestFn,
		onSuccess: () => {
			if (config?.onSuccess) {
				config.onSuccess();
			}
		},
		onError: (error) => {
			if (config?.onError) {
				config.onError(error);
			}
		},
	});

	const acceptFriendRequest = (id: number) => {
		acceptFriendRequestMutation.mutate(id);
	};

	return acceptFriendRequest;
};

const sentFriendRequestsQueryKey = (userId: number | undefined) => {
	return ["sentFriendRequests", userId];
};

const receivedFriendRequestsQueryKey = (userId: number | undefined) => {
	return ["receivedFriendRequests", userId];
};

const invalidateSentFriendRequest = (queryClient: QueryClient, userId: number) => {
	queryClient.invalidateQueries({ queryKey: sentFriendRequestsQueryKey(userId) });
};

const invalidateReceivedFriendRequest = (queryClient: QueryClient, userId: number) => {
	queryClient.invalidateQueries({ queryKey: receivedFriendRequestsQueryKey(userId) });
};
