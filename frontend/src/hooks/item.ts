import { QueryClient, useQuery } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import { useEffect, useState } from "react";
import ItemType from "../types/ItemType";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ItemInputType from "../types/ItemInputType";
import { StatusCodes } from "http-status-codes";

export const useGetItem = (id: number) => {
	const [item, setItem] = useState<ItemType | undefined>(undefined);

	const {
		data: dataItem,
		isSuccess: isSuccessItem,
		error,
	} = useQuery({
		queryKey: ["item", id],
		queryFn: () => axiosInstance.get(`item/${id}`),
		enabled: !!id,
	});

	const notFound = error?.response?.status === StatusCodes.NOT_FOUND;

	const { data: dataOwner, isSuccess: isSuccessOwner } = useQuery({
		queryKey: ["itemOwner", id],
		queryFn: () => axiosInstance.get(`item/${id}/owner`),
		enabled: !!id && !notFound,
	});

	const { data: dataReservation, isSuccess: isSuccessReservation } = useQuery({
		queryKey: ["itemReservation", id],
		queryFn: () => axiosInstance.get(`item/${id}/reservation`),
		enabled: !!id && !notFound,
	});

	useEffect(() => {
		if (isSuccessItem && isSuccessOwner && isSuccessReservation) {
			const { id, title, description, link, wishlist, createdAt } = dataItem.data.item;

			setItem({
				id,
				title,
				description,
				link,
				wishlist,
				createdAt,
				owner: dataOwner.data.owner,
				reservation: dataReservation.data.reservation?.id,
			});
		}
	}, [dataItem, dataOwner, dataReservation, isSuccessItem, isSuccessOwner, isSuccessReservation]);

	return {
		item,
		isSuccess: isSuccessItem && isSuccessOwner && isSuccessReservation,
		notFound,
	};
};

export const useGetItems = (wishlistId: number) => {
	const [items, setItems] = useState<ItemType[]>([]);

	const { data, isSuccess } = useQuery({
		queryKey: ["items", wishlistId],
		queryFn: () => axiosInstance.get(`wishlist/${wishlistId}/items`),
		enabled: !!wishlistId,
	});

	useEffect(() => {
		if (isSuccess) {
			setItems(data.data.items);
		}
	}, [data, isSuccess]);

	return {
		items,
		isSuccess,
	};
};

type UseCreateItemConfig = {
	onSuccess?: () => void;
	onError?: (error: Error) => void;
};

export const useCreateItem = (config?: UseCreateItemConfig) => {
	const queryClient = useQueryClient();

	const createItemFn = async ({ item, wishlistId }: { item: ItemInputType; wishlistId: number }) => {
		await axiosInstance.post("/item", {
			...item,
			wishlistId,
		});

		queryClient.invalidateQueries({ queryKey: ["items", wishlistId] });
	};

	const createItemMutation = useMutation({
		mutationFn: createItemFn,
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

	const createItem = (item: ItemInputType, wishlistId: number) => {
		createItemMutation.mutate({ item, wishlistId });
	};

	return { createItem };
};

type UseDeleteItemConfig = {
	onSuccess?: () => void;
	onError?: (error: Error) => void;
};

export const useDeleteItem = (config?: UseDeleteItemConfig) => {
	const queryClient = useQueryClient();

	const deleteItemFn = async (item: ItemType) => {
		await axiosInstance.delete(`/item/${item.id}`);
		invalidateItems(queryClient, item.wishlist);
	};

	const deleteItemMutation = useMutation({
		mutationFn: deleteItemFn,
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

	const deleteItem = (item: ItemType) => {
		deleteItemMutation.mutate(item);
	};

	return { deleteItem };
};

type UseUpdateItemConfig = {
	onSuccess?: () => void;
	onError?: (error: Error) => void;
};

export const useUpdateItem = (config?: UseUpdateItemConfig) => {
	const queryClient = useQueryClient();

	const updateItemFn = async ({ id, data }: { id: number; data: ItemInputType }) => {
		await axiosInstance.patch(`/item/${id}`, data);
		invalidateItem(queryClient, id);
	};

	const updateItemMutation = useMutation({
		mutationFn: updateItemFn,
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

	const updateItem = (id: number, data: ItemInputType) => {
		updateItemMutation.mutate({ id, data });
	};

	return updateItem;
};

const itemQueryKey = (id: number) => {
	return ["item", id];
};

const itemsQueryKey = (id: number) => {
	return ["items", id];
};

const itemOwnerQueryKey = (id: number) => {
	return ["itemOwner", id];
};

const itemReservationQueryKey = (id: number) => {
	return ["item", id];
};

const invalidateItems = (queryClient: QueryClient, wishlistId: number) => {
	queryClient.invalidateQueries({ queryKey: itemsQueryKey(wishlistId) });
};

const invalidateItem = (queryClient: QueryClient, id: number) => {
	queryClient.invalidateQueries({ queryKey: itemQueryKey(id) });
	queryClient.invalidateQueries({ queryKey: itemOwnerQueryKey(id) });
	queryClient.invalidateQueries({ queryKey: itemReservationQueryKey(id) });
};
