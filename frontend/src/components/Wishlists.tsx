import { useNavigate, NavLink, useParams } from "react-router-dom";
import WishlistType from "../types/WishlistType";
import WishlistInputType from "../types/WishlistInputType";
import useWishlistTypes from "../hooks/useWishlistTypes";
import { useAuth } from "../contexts/AuthContext";
import { useCreateWishlist, useGetWishlists } from "../hooks/wishlist";
import RoundedRect from "./RoundedRect";
import { Button } from "./ui/button";
import WishlistDialog from "./WishlistDialog";

const Wishlists = () => {
	const params = useParams<{ userId: string }>();
	const userId = Number(params.userId);
	const { userId: viewer } = useAuth();
	const navigate = useNavigate();
	const createWishlist = useCreateWishlist();
	const { wishlists } = useGetWishlists(userId);
	const { types } = useWishlistTypes();

	const isOwner: boolean = userId === viewer;

	const handleBack = () => {
		navigate(-1);
	};

	const Wishlist = (wishlist: WishlistType) => {
		return (
			<div key={wishlist.id}>
				<NavLink to={`/wishlist/${wishlist.id}`}>{wishlist.title}</NavLink>
			</div>
		);
	};

	const onSubmit = (input: WishlistInputType) => {
		console.log(input);
		createWishlist(input, userId);
	};

	const values = {
		title: "",
		description: "",
		type: types[0]?.id ?? 1,
	};

	return (
		<RoundedRect>
			<h2>Wishlists</h2>
			<Button onClick={handleBack}>Back</Button>
			<div>{wishlists?.map((wishlist) => Wishlist(wishlist))}</div>
			{isOwner && (
				<WishlistDialog
					config={{
						title: "Create new wishlist",
						submitButtonTitle: "Create",
						onSubmit,
						values,
					}}
				/>
			)}
		</RoundedRect>
	);
};

export default Wishlists;
