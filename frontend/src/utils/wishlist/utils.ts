import WishlistTypeInfoType from "@/types/WishlistTypeInfoType";
import WishlistTypeType from "@/types/WishlistTypeType";

export const findFormattedType = (types: WishlistTypeInfoType[], id: string | number) => {
	const i = Number(id);
	return types.find((t) => t.id === i);
};

export const getFormattedType = (type: WishlistTypeType): WishlistTypeInfoType => {
	switch (type.name) {
		case "public":
			return {
				id: type.id,
				name: "Public",
				description: "Public wishlists can be seen by all users",
			};
		case "friends":
			return {
				id: type.id,
				name: "Friends only",
				description: "Friends only-wishlists can only be seen by your friends",
			};
		case "hidden":
			return { id: type.id, name: "Private", description: "Private wishlists can only be seen by you" };
		default:
			return {
				id: -1,
				name: "N/A",
				description: "N/A",
			};
	}
};
