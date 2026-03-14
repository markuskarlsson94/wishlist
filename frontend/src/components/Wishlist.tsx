import { useState, useEffect } from "react";
import ItemInputType from "../types/ItemInputType";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCreateItem, useGetItems } from "../hooks/item";
import { useDeleteWishlist, useGetWishlist, useUpdateWishlist } from "../hooks/wishlist";
import useWishlistTypes from "../hooks/useWishlistTypes";
import WishlistInputType from "../types/WishlistInputType";
import RoundedRect from "./RoundedRect";
import ItemDialog from "./dialogs/ItemDialog";
import { Button, buttonVariants } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import WishlistForm from "@/forms/WishlistForm";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "./ui/alert-dialog";
import { EllipsisVertical } from "lucide-react";
import { CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useGetComments } from "@/hooks/comment";
import ItemType from "@/types/ItemType";
import HoverCard from "./HoverCard";
import EditIcon from "./icons/EditIcon";
import DeleteIcon from "./icons/DeleteIcon";
import Tooltip from "./Tooltip";
import { useGetReservations } from "@/hooks/reservation";
import ReservationType from "@/types/ReservationType";
import { findFormattedType, getFormattedType } from "@/utils/wishlist/utils";
import WishlistTypeInfoType from "@/types/WishlistTypeInfoType";
import { Badge } from "./ui/badge";
import NotFound from "./NotFound";
import { useGetUser } from "@/hooks/user";
import Navbar from "./Navbar";
import { cn } from "@/lib/utils";
import LoadingSpinner from "./LoadingSpinner";
import { StatusCodes } from "http-status-codes";
import { AxiosError } from "axios";

const Wishlist = () => {
	const [isOwner, setIsOwner] = useState<boolean>(false);
	const params = useParams<{ id: string }>();
	const id = Number(params.id);
	const { wishlist, isSuccess: isSuccessWishlist, isLoading: isLoadingWishlist, notFound } = useGetWishlist(id);
	const updateWishlist = useUpdateWishlist();
	const { userId } = useAuth();
	const { user } = useGetUser(wishlist?.owner);
	const navigate = useNavigate();
	const deleteWishlist = useDeleteWishlist({
		onSuccess: () => {
			navigate(`/user/${userId}/wishlists`, { replace: true });
		},
	});
	const { items, isSuccess: isSuccessItems, isLoading: isLoadingItems } = useGetItems(id);
	const { createItem } = useCreateItem({
		onError: (error: AxiosError) => {
			if (error.response?.status === StatusCodes.FORBIDDEN) {
				setErrorOpen(true);
			}
		},
	});
	const { types } = useWishlistTypes();
	const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
	const { reservations } = useGetReservations(userId);
	const formattedTypes = types.map((t) => getFormattedType(t));
	const [type, setType] = useState<WishlistTypeInfoType | undefined>(undefined);
	const [errorOpen, setErrorOpen] = useState(false);

	const isSuccess = isSuccessWishlist && isSuccessItems;
	const isLoading = isLoadingWishlist || isLoadingItems;

	useEffect(() => {
		if (isSuccessWishlist) {
			setIsOwner(wishlist?.owner === userId);
			if (wishlist) setType(findFormattedType(formattedTypes, wishlist.type));
		}
	}, [wishlist, isSuccessWishlist]);

	const Item = ({ item }: { item: ItemType }) => {
		const { comments } = useGetComments(item.id);
		const commentCount = comments.length;
		const reserved = reservations.some((r: ReservationType) => r.item === item.id);

		return (
			<div>
				<NavLink to={`/item/${item.id}`}>
					<HoverCard>
						<CardHeader>
							<div className="flex flex-wrap gap-y-1 items-start">
								<div>
									<CardTitle className="break-all">{item.title}</CardTitle>
									<CardDescription className="break-all">{item.description}</CardDescription>
								</div>
								<div className="flex gap-x-3 ml-auto">
									{reserved && <Badge>Reserved by you</Badge>}
									{commentCount > 0 && (
										<Badge variant={"secondary"}>{`${commentCount} ${
											commentCount > 1 ? "comments" : "comment"
										}`}</Badge>
									)}
								</div>
							</div>
						</CardHeader>
					</HoverCard>
				</NavLink>
			</div>
		);
	};

	const onSubmitItem = (input: ItemInputType) => {
		if (wishlist) createItem(input, wishlist.id);
	};

	const onSubmitWishlist = (input: WishlistInputType) => {
		if (wishlist) updateWishlist(wishlist.id, input);
		setIsEditDialogOpen(false);
	};

	const itemValues: ItemInputType = {
		title: "",
		description: "",
		link: "",
	};

	const wishlistValues = {
		title: wishlist?.title || "",
		description: wishlist?.description || "",
		type: wishlist?.type || types[0]?.id,
	};

	const breadcrumbProps = () => {
		return isOwner
			? {
					breadcrumbs: [
						{ title: "My Wishlists", link: `/user/${userId}/wishlists` },
						{ title: wishlist?.title },
					],
					isLoading: !userId || !wishlist,
			  }
			: {
					breadcrumbs: [
						{ title: user?.firstName, link: `/user/${user?.id}`, userId: user?.id },
						{ title: "Wishlists", link: `/user/${wishlist?.owner}/wishlists` },
						{ title: wishlist?.title },
					],
					isLoading: !user || !wishlist,
			  };
	};

	if (notFound) {
		return <NotFound type="Wishlist" />;
	}

	return (
		<div className="flex flex-col gap-y-2">
			<Navbar props={breadcrumbProps()} />
			<RoundedRect>
				{isLoading && <LoadingSpinner className="m-auto" />}
				{isSuccess && wishlist && (
					<>
						<div className="flex items-start justify-between gap-x-3">
							<p className={cn("font-medium break-all", isOwner ? "pt-[0.3rem]" : "")}>
								{wishlist.title}
							</p>

							<div className="flex gap-x-3 items-center">
								{type && (
									<Badge variant={"secondary"}>
										<Tooltip tooltip={type.description}>
											<p className="text-sm text-gray-500 text-nowrap">{type.name}</p>
										</Tooltip>
									</Badge>
								)}

								{isOwner && (
									<div className="float-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button size={"icon"} variant={"ghost"}>
													<EllipsisVertical />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													onClick={() => setIsEditDialogOpen(true)}
													className="flex justify-between items-center"
												>
													<span>Edit</span>
													<EditIcon />
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => setIsDeleteDialogOpen(true)}
													className="flex justify-between items-center"
												>
													<span>Delete</span>
													<DeleteIcon />
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>

										<Dialog
											open={isEditDialogOpen}
											onOpenChange={() => setIsEditDialogOpen(!isEditDialogOpen)}
										>
											<DialogTrigger></DialogTrigger>
											<DialogContent>
												<DialogHeader>
													<DialogTitle>Edit wishlist</DialogTitle>
												</DialogHeader>
												<WishlistForm
													config={{
														open: isEditDialogOpen,
														values: wishlistValues,
														onSubmit: onSubmitWishlist,
														submitButtonTitle: "Save",
													}}
												/>
											</DialogContent>
										</Dialog>

										<AlertDialog
											open={isDeleteDialogOpen}
											onOpenChange={() => setIsDeleteDialogOpen(!isDeleteDialogOpen)}
										>
											<AlertDialogTrigger asChild></AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>Delete wishlist</AlertDialogTitle>
													<AlertDialogDescription>
														Are you sure you want to permanently delete this wishlist and
														all its items?
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<AlertDialogAction
														className={buttonVariants({ variant: "destructive" })}
														onClick={() => {
															if (wishlist) {
																deleteWishlist(wishlist.id);
															}
														}}
													>
														Delete
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								)}
							</div>
						</div>

						{items && (
							<>
								<div className="my-6">
									<p className="break-all">{wishlist.description}</p>
								</div>

								<div className="flex flex-col gap-y-3">
									{items.length === 0 && (
										<div className="flex">
											<p className="m-auto text-2xl font-medium text-gray-300">No items</p>
										</div>
									)}
									{items.map((item) => (
										<Item key={item.id} item={item} />
									))}
									{isOwner && (
										<div className="self-end mt-3">
											<ItemDialog
												config={{
													title: "Add item",
													submitButtonTitle: "Add",
													onSubmit: onSubmitItem,
													values: itemValues,
												}}
											/>
										</div>
									)}
								</div>
							</>
						)}
						<AlertDialog open={errorOpen} onOpenChange={setErrorOpen}>
							<AlertDialogContent>
								<AlertDialogHeader className="font-medium">Error</AlertDialogHeader>
								Too many items
								<AlertDialogFooter>
									<AlertDialogCancel>Close</AlertDialogCancel>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</>
				)}
			</RoundedRect>
		</div>
	);
};

export default Wishlist;
