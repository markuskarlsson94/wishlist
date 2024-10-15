import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import WishlistType from "../types/WishlistType";
import WishlistInputType from "../types/WishlistInputType";

export const useGetWishlist = (id: number) => {
    const { data, isSuccess } = useQuery<WishlistType>({
        queryKey: ["wishlist", id],
        queryFn: async () => {
            const data = await axiosInstance.get(`wishlist/${id}`);
            return data.data.wishlist;
        },
    });

    return {
        wishlist: data,
        isSuccess,
    };
};

export const useGetWishlists = (userId: number) => {
    const { data, isSuccess } = useQuery<WishlistType[]>({
        queryKey: ["wishlists", userId],
        queryFn: async () => {
            const data = await axiosInstance.get(`user/${userId}/wishlists`);
            return data.data.wishlists;
        }
    });

    return {
        wishlists: data,
        isSuccess,
    };
};

type UseCreateWishlistConfig = {
    onSuccess?: () => void,
    onError?: (error: Error) => void,
};

export const useCreateWishlist = (config?: UseCreateWishlistConfig) => {
    const queryClient = useQueryClient();

    const createWishlistFn = async ({ wishlist, userId }: { wishlist: WishlistInputType, userId: number }) => {
        await axiosInstance.post("/wishlist", {
            ...wishlist,
        });

        queryClient.invalidateQueries({ queryKey: ["wishlists", userId] });
    };

    const createWishlistMutation = useMutation({
        mutationFn: createWishlistFn,
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

    const createWishlist = (wishlist: WishlistInputType, userId: number) => {
        createWishlistMutation.mutate({ wishlist, userId });
    };

    return createWishlist;
};

type UseDeleteWishlistConfig = {
    onSuccess?: () => void,
    onError?: (error: Error) => void,
};

export const useDeleteWishlist = (config?: UseDeleteWishlistConfig) => {
    const queryClient = useQueryClient();

    const deleteWishlistFn = async (id: number) => {
        if (id) {
            await axiosInstance.delete(`/wishlist/${id}`);
            queryClient.invalidateQueries({ queryKey: ["wishlists", id] });
        }
    };

    const deleteWishlistMutation = useMutation({
        mutationFn: deleteWishlistFn,
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

    const deleteWishlist = (id: number) => {
        deleteWishlistMutation.mutate(id);
    };

    return deleteWishlist;
};

type UseUpdateWishlistConfig = {
    onSuccess?: () => void,
    onError?: (error: Error) => void,
};

export const useUpdateWishlist = (config?: UseUpdateWishlistConfig) => {
    const queryClient = useQueryClient();

    const updateWishlistFn = async ({ id, data }: { id: number, data: WishlistInputType }) => {
        await axiosInstance.patch(`/wishlist/${id}`, data);
        queryClient.invalidateQueries({ queryKey: ["wishlist", id] });
    };

    const updateWishlistMutation = useMutation({
        mutationFn: updateWishlistFn,
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

    const updateWishlist = (id: number, data: WishlistInputType) => {
        updateWishlistMutation.mutate({ id, data });
    };

    return updateWishlist;
};