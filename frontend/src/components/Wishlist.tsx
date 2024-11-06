import { useState, useEffect } from "react";
import ItemInputType from "../types/ItemInputType";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import ItemForm from "../forms/ItemForm";
import { useAuth } from "../contexts/AuthContext";
import { useCreateItem, useGetItems } from "../hooks/item";
import { useDeleteWishlist, useGetWishlist, useUpdateWishlist } from "../hooks/wishlist";
import useWishlistTypes from "../hooks/useWishlistTypes";
import WishlistInputType from "../types/WishlistInputType";
import RoundedRect from "./RoundedRect";
import WishlistDialog from "./WishlistDialog";

const Wishlist = () => {
	const [isOwner, setIsOwner] = useState<boolean>(false);
	const params = useParams<{ id: string }>();
	const id = Number(params.id);
	const { wishlist, isSuccess } = useGetWishlist(id);
	const updateWishlist = useUpdateWishlist();
	const { userId } = useAuth();
	const navigate = useNavigate();
	const deleteWishlist = useDeleteWishlist({
		onSuccess: () => {
			navigate(`/user/${userId}/wishlists`, { replace: true });
		},
	});
	const [showCreateItem, setShowCreateItem] = useState<boolean>(false);
	const { items } = useGetItems(id);
	const { createItem } = useCreateItem();
	const { types } = useWishlistTypes();

	useEffect(() => {
		if (isSuccess) {
			setIsOwner(wishlist?.owner === userId);
		}
	}, [wishlist, isSuccess]);

	const Item = (item: any) => {
		return (
			<div key={item.id}>
				<NavLink to={`/item/${item.id}`}>{item.title}</NavLink>
			</div>
		);
	};

	const handleShowCreateItem = () => {
		setShowCreateItem(true);
	};

	const handleAddItem = (item: ItemInputType) => {
		if (wishlist) {
			createItem(item, wishlist.id);
		}

		setShowCreateItem(false);
	};

	const handleDeleteWishlist = () => {
		deleteWishlist(id);
	};

	const handleCancel = () => {
		setShowCreateItem(false);
	};

	const handleBack = () => {
		navigate(-1);
	};

	const itemValues: ItemInputType = {
		title: "",
		description: "",
		link: "",
	};

	const onSubmit = (input: WishlistInputType) => {
		if (wishlist) updateWishlist(wishlist.id, input);
	};

	const values = {
		title: wishlist?.title || "",
		description: wishlist?.description || "",
		type: wishlist?.type || types[0]?.id,
	};

	return (
		<RoundedRect>
			<h2>Wishlist</h2>
			<button onClick={handleBack}>Back</button>
			<h3>{wishlist?.title}</h3>
			<p>{wishlist?.description}</p>
			{items?.map((item) => Item(item))}
			{isOwner && (
				<>
					{showCreateItem ? (
						ItemForm(itemValues, handleAddItem, handleCancel)
					) : (
						<button onClick={handleShowCreateItem}>Add item</button>
					)}
					<WishlistDialog
						config={{
							title: "Edit wishlist",
							submitButtonTitle: "Edit",
							onSubmit,
							values,
						}}
					/>
					<button onClick={handleDeleteWishlist}>Delete wishlist</button>
				</>
			)}
		</RoundedRect>
	);
};

export default Wishlist;
