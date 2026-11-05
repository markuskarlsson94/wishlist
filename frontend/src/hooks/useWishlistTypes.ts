import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import WishlistTypeType from "../types/WishlistTypeType";

type WishlistTypesRespons = {
	data: {
		types: WishlistTypeType[];
	};
};

const useWishlistTypes = () => {
	const { data, ...rest } = useQuery<WishlistTypesRespons>({
		queryKey: ["wishlistTypes"],
		queryFn: () => axiosInstance.get("wishlist/types"),
	});

	const types = data?.data.types ?? [];
	const publicType = data?.data.types.find((r: WishlistTypeType) => r.name === "public")?.id;
	const friendType = data?.data.types.find((r: WishlistTypeType) => r.name === "friends")?.id;
	const inviteType = data?.data.types.find((r: WishlistTypeType) => r.name === "invite")?.id;
	const hiddenType = data?.data.types.find((r: WishlistTypeType) => r.name === "hidden")?.id;

	return { types, publicType, friendType, inviteType, hiddenType, ...rest };
};

export default useWishlistTypes;
