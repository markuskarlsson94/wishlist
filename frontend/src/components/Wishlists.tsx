import { useNavigate, NavLink, useParams } from "react-router-dom";
import WishlistType from "../types/WishlistType";
import WishlistInputType from "../types/WishlistInputType";
import useWishlistTypes from "../hooks/useWishlistTypes";
import { useAuth } from "../contexts/AuthContext";
import { useCreateWishlist, useGetWishlists } from "../hooks/wishlist";
import RoundedRect from "./RoundedRect";
import WishlistDialog from "./dialogs/WishlistDialog";
import BackButton from "./BackButton";
import { CardDescription, CardHeader, CardTitle } from "./ui/card";
import HoverCard from "./HoverCard";
import { useGetItems } from "@/hooks/item";
import { Box } from "lucide-react";
import Tooltip from "./Tooltip";
import { useGetUser } from "@/hooks/user";

const Wishlists = () => {
	const params = useParams<{ userId: string }>();
	const userId = Number(params.userId);
	const { user, isSuccess } = useGetUser(userId);
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
			<div>
				<NavLink to={`/wishlist/${wishlist.id}`}>
					<HoverCard>
						<CardHeader>
							<div className="flex justify-between items-center">
								<div>
									<CardTitle>{wishlist.title}</CardTitle>
									<CardDescription>{wishlist.description}</CardDescription>
								</div>
								{itemCount > 0 && (
									<Tooltip tooltip={`Contains ${itemCount} items`}>
										<div className="flex gap-x-1 float-right">
											<Box strokeWidth={1.5} opacity={0.5} /> {itemCount}
										</div>
									</Tooltip>
								)}
							</div>
						</CardHeader>
					</HoverCard>
				</NavLink>
			</div>
		);
	};

	const onSubmit = (input: WishlistInputType) => {
		createWishlist(input, userId);
	};

	const getTitle = () => {
		if (isOwner) return "My Wishlists";

		if (isSuccess && user) {
			const { firstName, lastName } = user;
			return `${firstName} ${lastName}'s wishslists`;
		}

		return "";
	};

	const values = {
		title: "",
		description: "",
		type: types[0]?.id ?? 1,
	};

	return (
		<RoundedRect>
			<div className="flex flex-col gap-y-3">
				<div className="flex flex-row items-center">
					<BackButton onClick={handleBack} />
					<p className="m-auto font-medium">{getTitle()}</p>
				</div>

				<div className="h-3" />

				{wishlists && wishlists.length === 0 && (
					<div className="flex">
						<p className="m-auto text-2xl font-medium text-gray-300">No wishlists</p>
					</div>
				)}
				{wishlists?.map((wishlist) => (
					<Wishlist key={wishlist.id} wishlist={wishlist} />
				))}

				{isOwner && (
					<div className="self-end">
						<WishlistDialog
							config={{
								title: "Create new wishlist",
								submitButtonTitle: "Create",
								onSubmit,
								values,
							}}
						/>
					</div>
				)}
			</div>
		</RoundedRect>
	);
};

export default Wishlists;
