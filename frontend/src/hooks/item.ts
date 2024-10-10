import { useQuery } from "@tanstack/react-query"
import axiosInstance from "../axiosInstance";
import { useEffect, useState } from "react";
import ItemType from "../types/ItemType";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ItemInputType from "../types/ItemInputType";

export const useGetItem = (id: number) => {
    const [item, setItem] = useState<ItemType | undefined>(undefined);

    const { data: dataItem, isSuccess: isSuccessItem } = useQuery({
        queryKey: ["item", id],
        queryFn: () => axiosInstance.get(`item/${id}`),
        enabled: !!id,
    });
    
    const { data: dataOwner, isSuccess: isSuccessOwner } = useQuery({
        queryKey: ["itemOwner", id],
        queryFn: () => axiosInstance.get(`item/${id}/owner`),
        enabled: !!id,
    });

    useEffect(() => {
        if (isSuccessItem && isSuccessOwner) {
            const { 
                id, 
                title, 
                description, 
                wishlist, 
                createdAt
            } = dataItem.data.item; 

            setItem({
                id,
                title,
                description,
                wishlist,
                createdAt,
                owner: dataOwner.data.owner,
            });
        }
    }, [dataItem, dataOwner, isSuccessItem, isSuccessOwner]);

    return {
        item,
        isSuccess: isSuccessItem && isSuccessOwner,
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
    onSuccess?: () => void,
    onError?: (error: Error) => void,
};

export const useCreateItem = (config?: UseCreateItemConfig) => {
    const queryClient = useQueryClient();

    const createItemFn = async ({ item, wishlistId }: { item: ItemInputType, wishlistId: number }) => {
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
        }
    });

    const createItem = (item: ItemInputType, wishlistId: number) => {
        createItemMutation.mutate({ item, wishlistId });
    };

    return { createItem };
};

type UseDeleteItemConfig = {
    onSuccess?: () => void,
    onError?: (error: Error) => void,
};

export const useDeleteItem = (config?: UseDeleteItemConfig) => {
    const queryClient = useQueryClient();

    const deleteItemFn = async (id: number) => {
        if (id) {
            await axiosInstance.delete(`/item/${id}`);
            queryClient.invalidateQueries({ queryKey: ["items", id] });
        }
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
        }
    });

    const deleteItem = (id: number) => {
        deleteItemMutation.mutate(id);
    };

    return { deleteItem };
};