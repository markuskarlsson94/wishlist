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
import NotFound from "./NotFound";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "./ui/breadcrumb";

const Wishlists = () => {
	const params = useParams<{ userId: string }>();
	const userId = Number(params.userId);
	const { user, notFound } = useGetUser(userId);
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
									<Tooltip tooltip={`Contains ${itemCount} ${itemCount > 1 ? "items" : "item"}`}>
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

	const values = {
		title: "",
		description: "",
		type: types[0]?.id ?? 1,
	};

	if (notFound) {
		return <NotFound type="User" />;
	}

	return (
		<RoundedRect>
			<div className="flex flex-col gap-y-3">
				<div className="relative flex flex-row items-center">
					<BackButton onClick={handleBack} />
					<div className="absolute left-1/2 transform -translate-x-1/2 font-medium">
						{isOwner ? (
							<p>My Wishlists</p>
						) : (
							<Breadcrumb>
								<BreadcrumbList>
									<BreadcrumbItem>
										<BreadcrumbLink asChild>
											<NavLink to={`/user/${user?.id}`}>
												{`${user?.firstName} ${user?.lastName}`}
											</NavLink>
										</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator />
									<BreadcrumbItem className="text-black text-base">Wishlists</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
						)}
					</div>
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
	);
};

export default Wishlists;
