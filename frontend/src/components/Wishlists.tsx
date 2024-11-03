import { useState } from "react";
import { useNavigate, NavLink, useParams } from "react-router-dom";
import WishlistType from "../types/WishlistType";
import WishlistForm from "../forms/WishlistForm";
import WishlistInputType from "../types/WishlistInputType";
import useWishlistTypes from "../hooks/useWishlistTypes";
import { useAuth } from "../contexts/AuthContext";
import { useCreateWishlist, useGetWishlists } from "../hooks/wishlist";
import RoundedRect from "./RoundedRect";

const Wishlists = () => {
	const [showCreate, setShowCreate] = useState<boolean>(false);
	const params = useParams<{ userId: string }>();
	const userId = Number(params.userId);
	const { userId: viewer } = useAuth();
	const navigate = useNavigate();
	const { types } = useWishlistTypes();
	const createWishlist = useCreateWishlist();
	const { wishlists } = useGetWishlists(userId);

	const isOwner: boolean = userId === viewer;

	const handleBack = () => {
		navigate(-1);
	};

	const handleCreateNew = () => {
		setShowCreate(true);
	};

	const handleAdd = (values: WishlistInputType) => {
		createWishlist(values, userId);
		setShowCreate(false);
	};

	const handleCancel = () => {
		setShowCreate(false);
	};

	const Wishlist = (wishlist: WishlistType) => {
		return (
			<div key={wishlist.id}>
				<NavLink to={`/wishlist/${wishlist.id}`}>{wishlist.title}</NavLink>
			</div>
		);
	};

	const initialWishlist: WishlistInputType = {
		title: "",
		description: "",
		type: types[0]?.id,
	};

	return (
		<RoundedRect>
			<h2>Wishlists</h2>
			<button onClick={handleBack}>Back</button>
			<div>{wishlists?.map((wishlist) => Wishlist(wishlist))}</div>
			{isOwner && (
				<>
					{showCreate ? (
						WishlistForm(initialWishlist, types, handleAdd, handleCancel)
					) : (
						<>
							<button onClick={handleCreateNew}>Create new wishlist</button>
						</>
					)}
				</>
			)}
		</RoundedRect>
	);
};

export default Wishlists;
