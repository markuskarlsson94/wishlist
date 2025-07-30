import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import ReservationType from "../types/ReservationType";

export const useGetReservations = (userId: number | undefined) => {
	const { data, isSuccess } = useQuery<ReservationType[]>({
		queryKey: ["reservations", userId],
		queryFn: async () => {
			const data = await axiosInstance.get(`user/${userId}/reservations`);
			return data.data.reservations;
		},
		enabled: !!userId,
	});

	const reservations = data || [];

	return {
		reservations,
		isSuccess,
	};
};

export const useGetReservationByItemId = (itemId: number | undefined) => {
	const { data, isSuccess } = useQuery<ReservationType[]>({
		queryKey: ["itemReservation", itemId],
		queryFn: async () => {
			const data = await axiosInstance.get(`item/${itemId}/reservation`);
			return data.data.reservation;
		},
		enabled: !!itemId,
	});

	return {
		reservation: data,
		isSuccess,
	};
};

type UseCreateReservationConfig = {
	userId: number | undefined;
	onSuccess?: () => void;
	onError?: (error: Error) => void;
};

export const useCreateReservation = (config: UseCreateReservationConfig) => {
	const queryClient = useQueryClient();

	const createReservationFn = async (itemId: number) => {
		if (!config?.userId) return;

		await axiosInstance.post(`/item/${itemId}/reserve`);

		queryClient.invalidateQueries({ queryKey: ["reservations", config.userId] });
		queryClient.invalidateQueries({ queryKey: ["itemReservation", itemId] });
	};

	const createReservationMutation = useMutation({
		mutationFn: createReservationFn,
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

	const createReservation = (itemId: number) => {
		createReservationMutation.mutate(itemId);
	};

	return createReservation;
};

type UseDeleteReservationConfig = {
	userId: number | undefined;
	onSuccess?: () => void;
	onError?: (error: Error) => void;
};

export const useDeleteReservation = (config: UseDeleteReservationConfig) => {
	const queryClient = useQueryClient();

	const deleteReservationFn = async ({ reservationId, itemId }: { reservationId: number; itemId: number }) => {
		if (!reservationId || !config.userId) return;

		await axiosInstance.delete(`/reservation/${reservationId}`);
		queryClient.invalidateQueries({ queryKey: ["reservations", config.userId] });
		queryClient.invalidateQueries({ queryKey: ["itemReservation", itemId] });
	};

	const deleteReservationMutation = useMutation({
		mutationFn: deleteReservationFn,
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

	const deleteReservation = (reservationId: number, itemId: number) => {
		deleteReservationMutation.mutate({ reservationId, itemId });
	};

	return deleteReservation;
};
