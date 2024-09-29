import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import WishlistTypeType from "../types/WishlistTypeType";

type WishlistTypesRespons = {
    data: {
        types: WishlistTypeType[]
    }
};

const useWishlistTypes = () => {
    const { data, ...rest } = useQuery<WishlistTypesRespons>({
        queryKey: ["wishlistTypes"],
        queryFn: () => axiosInstance.get("wishlist/types"),
    });

    const types = data?.data.types ?? [];

    return { types, ...rest };
};

export default useWishlistTypes;