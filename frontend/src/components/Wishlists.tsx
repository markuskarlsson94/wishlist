import { NavLink, useNavigate, useParams } from "react-router-dom";
import WishlistType from "../types/WishlistType";
import WishlistInputType from "../types/WishlistInputType";
import useWishlistTypes from "../hooks/useWishlistTypes";
import { useAuth } from "../contexts/AuthContext";
import { useCreateWishlist, useGetWishlists } from "../hooks/wishlist";
import RoundedRect from "./RoundedRect";
import WishlistDialog from "./dialogs/WishlistDialog";
import { CardDescription, CardHeader, CardTitle } from "./ui/card";
import HoverCard from "./HoverCard";
import { useGetItems } from "@/hooks/item";
import { useGetUser } from "@/hooks/user";
import NotFound from "./NotFound";
import { Badge } from "./ui/badge";
import Navbar from "./Navbar";
import BackButton from "./BackButton";

const Wishlists = () => {
	const params = useParams<{ userId: string }>();
	const userId = Number(params.userId);
	const { user, notFound } = useGetUser(userId);
	const { userId: viewer } = useAuth();
	const createWishlist = useCreateWishlist();
	const { wishlists } = useGetWishlists(userId);
	const { types } = useWishlistTypes();
	const navigate = useNavigate();

	const isOwner: boolean = userId === viewer;

	const Wishlist = ({ wishlist }: { wishlist: WishlistType }) => {
		const { items } = useGetItems(wishlist.id);
		const itemCount = items.length || 0;

		return (
			<div>
				<NavLink to={`/wishlist/${wishlist.id}`}>
					<HoverCard>
						<CardHeader>
							<div className="flex flex-wrap gap-y-1 items-start">
								<div>
									<CardTitle>{wishlist.title}</CardTitle>
									<CardDescription>{wishlist.description}</CardDescription>
								</div>
								{itemCount > 0 && (
									<Badge variant={"secondary"} className="ml-auto">
										{`${itemCount} ${itemCount > 1 ? "items" : "item"}`}
									</Badge>
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

	const handleBack = () => {
		navigate(-1);
	};

	const values = {
		title: "",
		description: "",
		type: types[0]?.id ?? 1,
	};

	if (notFound) {
		return <NotFound type="User" />;
	}

	const breadcrumbs = () => {
		return [{ title: user?.firstName, link: `/user/${user?.id}`, userId: user?.id }];
	};

	return (
		<div className="flex flex-col gap-y-2">
			{!isOwner && <Navbar breadcrumbs={breadcrumbs()} />}
			<RoundedRect>
				<div className="flex flex-col gap-y-5">
					{isOwner ? (
						<div className="relative flex gap-x-3 items-center">
							<BackButton onClick={handleBack} />
							<p className="absolute left-1/2 transform -translate-x-1/2 font-medium">My Wishlists</p>
						</div>
					) : (
						<p className="font-medium">Wishlists</p>
					)}

					{wishlists && wishlists.length === 0 && (
						<div className="flex">
							<p className="m-auto text-2xl font-medium text-gray-300">No wishlists</p>
						</div>
					)}
					{wishlists?.map((wishlist) => (
						<Wishlist key={wishlist.id} wishlist={wishlist} />
					))}

					{isOwner && (
						<div className="self-end mt-6">
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
		</div>
	);
};

export default Wishlists;
