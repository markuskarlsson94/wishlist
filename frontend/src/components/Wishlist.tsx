import { useState, useEffect } from "react";
import ItemInputType from "../types/ItemInputType";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCreateItem, useGetItems } from "../hooks/item";
import { useDeleteWishlist, useGetWishlist, useUpdateWishlist } from "../hooks/wishlist";
import useWishlistTypes from "../hooks/useWishlistTypes";
import WishlistInputType from "../types/WishlistInputType";
import RoundedRect from "./RoundedRect";
import ItemDialog from "./ItemDialog";
import { buttonVariants } from "./ui/button";
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
import { EllipsisVertical, MessageCircle } from "lucide-react";
import IconButton from "./IconButton";
import BackButton from "./BackButton";
import { CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useGetComments } from "@/hooks/comment";
import ItemType from "@/types/ItemType";
import HoverCard from "./HoverCard";
import EditIcon from "./icons/EditIcon";
import DeleteIcon from "./icons/DeleteIcon";

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
	const { items } = useGetItems(id);
	const { createItem } = useCreateItem();
	const { types } = useWishlistTypes();
	const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

	useEffect(() => {
		if (isSuccess) {
			setIsOwner(wishlist?.owner === userId);
		}
	}, [wishlist, isSuccess]);

	const Item = ({ item }: { item: ItemType }) => {
		const { comments } = useGetComments(item.id);
		const commentCount = comments?.length || 0;

		return (
			<div key={item.id}>
				<NavLink to={`/item/${item.id}`}>
					<HoverCard>
						<CardHeader>
							<div className="flex justify-between items-center">
								<div>
									<CardTitle>{item.title}</CardTitle>
									<CardDescription>{item.description}</CardDescription>
								</div>
								{commentCount > 0 && (
									<div className="flex gap-x-1 float-right">
										<MessageCircle strokeWidth={1.5} opacity={0.5} /> {commentCount}
									</div>
								)}
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

	return (
		<RoundedRect>
			<div className="flex justify-between">
				<BackButton onClick={handleBack} />
				{isOwner && (
					<div>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<IconButton variant={"ghost"}>
									<EllipsisVertical />
								</IconButton>
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
			<h3>{wishlist?.title}</h3>
			<p>{wishlist?.description}</p>
			<div className="flex flex-col gap-y-3">
				{items?.map((item) => (
					<Item item={item} />
				))}
				{isOwner && (
					<>
						<ItemDialog
							config={{
								title: "Add item",
								submitButtonTitle: "Add",
								onSubmit: onSubmitItem,
								values: itemValues,
							}}
						/>
					</>
				)}
			</div>
		</RoundedRect>
	);
};

export default Wishlist;
