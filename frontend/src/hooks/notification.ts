import axiosInstance from "@/axiosInstance";
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetUserNotifications = (userId: number | undefined) => {
	const { data, ...rest } = useQuery({
		queryKey: notificationsQueryKey(userId),
		queryFn: () => axiosInstance.get(`user/${userId}/notifications`),
		enabled: !!userId,
	});

	const notifications = data?.data.notifications ?? [];

	return {
		notifications,
		...rest,
	};
};

export const useGetCommentNotifications = (itemId: number | undefined) => {
	const { data, ...rest } = useQuery({
		queryKey: ["itemNotifications", itemId],
		queryFn: () => axiosInstance.get(`/item/${itemId}/notifications`),
		enabled: !!itemId,
	});

	const notifications = data?.data.notifications ?? [];

	return {
		notifications,
		...rest,
	};
};

type UseDeleteNotificationConfig = {
	userId: number | undefined;
};

export const useDeleteNotification = (config?: UseDeleteNotificationConfig) => {
	const queryClient = useQueryClient();

	const deleteNotificationFn = async (id: number) => {
		await axiosInstance.delete(`/notification/${id}`);
	};

	const deleteNotificationMutation = useMutation({
		mutationFn: deleteNotificationFn,
		onSuccess: () => {
			if (config?.userId) invalidateNotifications(queryClient, config.userId);
		},
	});

	const deleteNotification = (id: number) => {
		deleteNotificationMutation.mutate(id);
	};

	return deleteNotification;
};

type UseDeleteNotificationsByItemConfig = {
	userId: number | undefined;
};

export const useDeleteNotificationsByItem = (config?: UseDeleteNotificationsByItemConfig) => {
	const queryClient = useQueryClient();

	const deleteNotificationsFn = async (itemId: number) => {
		await axiosInstance.delete(`/item/${itemId}/notifications`);
	};

	const deleteNotificationsMutation = useMutation({
		mutationFn: deleteNotificationsFn,
		onSuccess: () => {
			if (config?.userId) invalidateNotifications(queryClient, config.userId);
		},
	});

	const deleteNotificatiosnByItem = (id: number) => {
		deleteNotificationsMutation.mutate(id);
	};

	return deleteNotificatiosnByItem;
};

type UseDeleteNotificationsByUserConfig = {
	userId: number | undefined;
};

export const useDeleteNotifcationsByUser = (config: UseDeleteNotificationsByUserConfig) => {
	const queryClient = useQueryClient();

	const deleteNotificationsFn = async () => {
		await axiosInstance.delete(`/user/${config.userId}/notifications`);
	};

	const deleteNotificationsMutation = useMutation({
		mutationFn: deleteNotificationsFn,
		onSuccess: () => {
			if (config?.userId) invalidateNotifications(queryClient, config.userId);
		},
	});

	const deleteNotificatiosnByUser = () => {
		deleteNotificationsMutation.mutate();
	};

	return deleteNotificatiosnByUser;
};

export const useGetNotificationTypes = () => {
	const { data, ...rest } = useQuery({
		queryKey: ["notificationTypes"],
		queryFn: () => axiosInstance.get("notification/types"),
	});

	return { types: data?.data.types, ...rest };
};

const notificationsQueryKey = (userId: number | undefined) => {
	return ["notifications", userId];
};

export const invalidateNotifications = (queryClient: QueryClient, userId: number) => {
	queryClient.invalidateQueries({ queryKey: notificationsQueryKey(userId) });
};
