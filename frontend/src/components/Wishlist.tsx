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
import { BookmarkCheck, EllipsisVertical, Info, MessageCircle } from "lucide-react";
import BackButton from "./BackButton";
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
import {
	Breadcrumb,
	BreadcrumbEllipsis,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { useGetUser } from "@/hooks/user";

const Wishlist = () => {
	const [isOwner, setIsOwner] = useState<boolean>(false);
	const params = useParams<{ id: string }>();
	const id = Number(params.id);
	const { wishlist, isSuccess, notFound } = useGetWishlist(id);
	const updateWishlist = useUpdateWishlist();
	const { userId } = useAuth();
	const { user } = useGetUser(wishlist?.owner);
	const navigate = useNavigate();
	const deleteWishlist = useDeleteWishlist({
		onSuccess: () => {
			navigate(`/user/${userId}/wishlists`, { replace: true });
		},
	});
	const { items } = useGetItems(id);
	const { createItem } = useCreateItem();
	const { types } = useWishlistTypes();
	const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
	const { reservations } = useGetReservations(userId);
	const formattedTypes = types.map((t) => getFormattedType(t));
	const [type, setType] = useState<WishlistTypeInfoType | undefined>(undefined);

	useEffect(() => {
		if (isSuccess) {
			setIsOwner(wishlist?.owner === userId);
			if (wishlist) setType(findFormattedType(formattedTypes, wishlist.type));
		}
	}, [wishlist, isSuccess]);

	const Item = ({ item }: { item: ItemType }) => {
		const { comments } = useGetComments(item.id);
		const commentCount = comments.length;
		const reserved = reservations.some((r: ReservationType) => r.item === item.id);

		return (
			<div>
				<NavLink to={`/item/${item.id}`}>
					<HoverCard>
						<CardHeader>
							<div className="flex justify-between items-center">
								<div>
									<CardTitle>{item.title}</CardTitle>
									<CardDescription>{item.description}</CardDescription>
								</div>
								<div className="flex gap-x-3">
									{reserved && (
										<Tooltip tooltip="Reserved by you">
											<BookmarkCheck strokeWidth={1.5} opacity={0.5} />
										</Tooltip>
									)}
									{commentCount > 0 && (
										<Tooltip
											tooltip={`Contains ${commentCount} ${
												commentCount > 1 ? "comments" : "comment"
											}`}
										>
											<div className="flex gap-x-1 float-right">
												<MessageCircle strokeWidth={1.5} opacity={0.5} /> {commentCount}
											</div>
										</Tooltip>
									)}
								</div>
							</div>
						</CardHeader>
					</HoverCard>
				</NavLink>
			</div>
		);
	};

	const handleBack = () => {
		navigate(-1);
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

	const wishlistsText = () => {
		return isOwner ? "My Wishlists" : `${user?.firstName}'s wishlists`;
	};

	if (notFound) {
		return <NotFound type="Wishlist" />;
	}

	return (
		<RoundedRect>
			<div className="relative flex justify-between items-center">
				<div className="absolute left-1/2 transform -translate-x-1/2 font-medium">
					{user && (
						<Breadcrumb>
							<BreadcrumbList>
								{!isOwner && (
									<>
										<BreadcrumbItem>
											<BreadcrumbEllipsis />
										</BreadcrumbItem>
										<BreadcrumbSeparator />
									</>
								)}
								<BreadcrumbLink asChild>
									<NavLink to={`/user/${user.id}/wishlists`}>{wishlistsText()}</NavLink>
								</BreadcrumbLink>
								<BreadcrumbSeparator />
								<BreadcrumbItem className="text-black text-base">{wishlist?.title}</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					)}
				</div>
				<BackButton onClick={handleBack} />
				<div className="flex gap-x-3 items-center">
					{type && (
						<Badge variant={"secondary"}>
							<Tooltip tooltip={type?.description}>
								<div className="flex items-center gap-x-1">
									<Info size={16} opacity={0.5} />
									<p className="text-sm text-gray-500">{type?.name}</p>
								</div>
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

							<Dialog open={isEditDialogOpen} onOpenChange={() => setIsEditDialogOpen(!isEditDialogOpen)}>
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
											Are you sure you want to permanently delete this wishlist and all its items?
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
			<div className="my-5">
				<p>{wishlist?.description}</p>
			</div>

			<div className="h-3" />

			<div className="flex flex-col gap-y-3">
				{items && items.length === 0 && (
					<div className="flex">
						<p className="m-auto text-2xl font-medium text-gray-300">No items</p>
					</div>
				)}
				{items?.map((item) => (
					<Item key={item.id} item={item} />
				))}
				{isOwner && (
					<div className="self-end mt-6">
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
		</RoundedRect>
	);
};

export default Wishlist;
