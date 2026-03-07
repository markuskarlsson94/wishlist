import { NavLink, useParams } from "react-router-dom";
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
import LoadingSpinner from "./LoadingSpinner";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
} from "./ui/alert-dialog";
import { useState } from "react";
import { StatusCodes } from "http-status-codes";
import { AxiosError } from "axios";

const Wishlists = () => {
	const params = useParams<{ userId: string }>();
	const userId = Number(params.userId);
	const { user, notFound } = useGetUser(userId);
	const { userId: viewer } = useAuth();
	const createWishlist = useCreateWishlist({
		onError: (error: AxiosError) => {
			if (error.response?.status === StatusCodes.FORBIDDEN) {
				setErrorOpen(true);
			}
		},
	});
	const { wishlists, isSuccess, isLoading } = useGetWishlists(userId);
	const { types } = useWishlistTypes();
	const [errorOpen, setErrorOpen] = useState(false);

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
									<CardTitle className="break-all">{wishlist.title}</CardTitle>
									<CardDescription className="break-all">{wishlist.description}</CardDescription>
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

	const values = {
		title: "",
		description: "",
		type: types[0]?.id ?? 1,
	};

	if (notFound) {
		return <NotFound type="User" />;
	}

	const breadcrumbProps = () => {
		return {
			breadcrumbs: [
				{ title: user?.firstName, link: `/user/${user?.id}`, userId: user?.id },
				{ title: "Wishlists" },
			],
			isLoading: !user,
		};
	};

	return (
		<div className="flex flex-col gap-y-2">
			{!isOwner && <Navbar props={breadcrumbProps()} />}
			<RoundedRect>
				{isLoading && <LoadingSpinner className="m-auto" />}
				{isSuccess && wishlists && (
					<div className="flex flex-col gap-y-6">
						{isOwner ? (
							<div className="relative flex gap-x-3 items-center">
								<BackButton />
								<p className="absolute left-1/2 transform -translate-x-1/2 font-medium">My Wishlists</p>
							</div>
						) : (
							<p className="font-medium">Wishlists</p>
						)}

						<div className="flex flex-col gap-y-3">
							{wishlists.length === 0 && (
								<div className="flex">
									<p className="m-auto text-2xl font-medium text-gray-300">No wishlists</p>
								</div>
							)}
							{wishlists.map((wishlist) => (
								<Wishlist key={wishlist.id} wishlist={wishlist} />
							))}
						</div>

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
						<AlertDialog open={errorOpen} onOpenChange={setErrorOpen}>
							<AlertDialogContent>
								<AlertDialogHeader className="font-medium">Error</AlertDialogHeader>
								Too many wishlists
								<AlertDialogFooter>
									<AlertDialogCancel>Close</AlertDialogCancel>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				)}
			</RoundedRect>
		</div>
	);
};

export default Wishlists;
