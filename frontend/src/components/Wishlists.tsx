import { useNavigate, NavLink, useParams } from "react-router-dom";
import WishlistType from "../types/WishlistType";
import WishlistInputType from "../types/WishlistInputType";
import useWishlistTypes from "../hooks/useWishlistTypes";
import { useAuth } from "../contexts/AuthContext";
import { useCreateWishlist, useGetWishlists } from "../hooks/wishlist";
import RoundedRect from "./RoundedRect";
import WishlistDialog from "./WishlistDialog";
import BackButton from "./BackButton";
import { CardDescription, CardHeader, CardTitle } from "./ui/card";
import HoverCard from "./HoverCard";
import { useGetItems } from "@/hooks/item";
import { Box } from "lucide-react";

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

	const Wishlist = ({ wishlist }: { wishlist: WishlistType }) => {
		const { items } = useGetItems(wishlist.id);
		const itemCount = items.length || 0;

		return (
			<div key={wishlist.id}>
				<NavLink to={`/wishlist/${wishlist.id}`}>
					<HoverCard>
						<CardHeader>
							<div className="flex justify-between items-center">
								<div>
									<CardTitle>{wishlist.title}</CardTitle>
									<CardDescription>{wishlist.description}</CardDescription>
								</div>
								{itemCount > 0 && (
									<div className="flex gap-x-1 float-right">
										<Box strokeWidth={1.5} opacity={0.5} /> {itemCount}
									</div>
								)}
							</div>
						</CardHeader>
					</HoverCard>
				</NavLink>
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
			<BackButton onClick={handleBack} />
			<div className="flex flex-col gap-y-3">
				{wishlists?.map((wishlist) => (
					<Wishlist wishlist={wishlist} />
				))}
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
			</div>
		</RoundedRect>
	);
};

export default Wishlists;
