import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useGetItem, useDeleteItem, useUpdateItem } from "../hooks/item";
import { useCreateReservation, useDeleteReservation } from "../hooks/reservation";
import ItemInputType from "../types/ItemInputType";
import { NavLink } from "react-router-dom";
import { useAddComment, useGetComments } from "../hooks/comment";
import AddCommentForm from "../forms/AddCommentForm";
import CommentInputType from "../types/CommentInputType";
import Comment from "./Comment";
import RoundedRect from "./RoundedRect";
import { Button, buttonVariants } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import IconButton from "./IconButton";
import { EllipsisVertical } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import ItemForm from "@/forms/ItemForm";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "./ui/alert-dialog";
import BackButton from "./BackButton";
import EditIcon from "./icons/EditIcon";
import DeleteIcon from "./icons/DeleteIcon";
import { H3, P } from "./ui/typography";

const Item = () => {
	const [isOwner, setIsOwner] = useState<boolean>(false);
	const params = useParams<{ id: string }>();
	const id = Number(params.id);
	const navigate = useNavigate();
	const { userId } = useAuth();
	const { item, isSuccess } = useGetItem(id);
	const createReservation = useCreateReservation({ userId });
	const deleteReservation = useDeleteReservation({ userId });
	const updateItem = useUpdateItem();
	const { comments } = useGetComments(id);
	const addComment = useAddComment({ itemId: id });
	const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

	const onDeleteItem = () => {
		if (item?.wishlist) {
			navigate(`/wishlist/${item.wishlist}`, { replace: true });
		}
	};

	const { deleteItem } = useDeleteItem({ onSuccess: onDeleteItem });

	useEffect(() => {
		if (isSuccess) {
			setIsOwner(item?.owner === userId);
		}
	}, [item, isSuccess]);

	const handleDelete = () => {
		if (item) {
			deleteItem(item);
		}
	};

	const handleReserve = () => {
		if (item) {
			createReservation(item.id);
		}
	};

	const handleUnreserve = () => {
		if (item?.reservation) {
			deleteReservation(item.reservation, item.id);
		}
	};

	const handleBack = () => {
		navigate(-1);
	};

	const reserveButton = () => {
		return <Button onClick={handleReserve}>Reserve</Button>;
	};

	const unreserveButton = () => {
		return <Button onClick={handleUnreserve}>Unreserve</Button>;
	};

	const handleAddComment = (data: CommentInputType) => {
		addComment(data.comment);
	};

	const onSubmitItem = (input: ItemInputType) => {
		if (item) updateItem(item.id, input);
		setIsEditDialogOpen(false);
	};

	const itemValues: ItemInputType = {
		title: item?.title || "",
		description: item?.description || "",
		link: item?.link || "",
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
									<DialogTitle>Edit item</DialogTitle>
								</DialogHeader>
								<ItemForm
									config={{
										open: isEditDialogOpen,
										values: itemValues,
										onSubmit: onSubmitItem,
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
									<AlertDialogTitle>Delete item</AlertDialogTitle>
									<AlertDialogDescription>
										Are you sure you want to permanently delete this item?
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										className={buttonVariants({ variant: "destructive" })}
										onClick={() => {
											handleDelete();
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
			<div className="my-5">
				<H3>{item?.title}</H3>
				<P>{item?.description}</P>
			</div>
			{item?.link && (
				<Button variant={"link"}>
					<NavLink to={`${item.link}`}>{item.link}</NavLink>
				</Button>
			)}
			<h3>Comments</h3>
			<div className="flex flex-col gap-y-3">
				{comments?.map((comment) => (
					<Comment key={comment.id} comment={comment} itemId={id} />
				))}
				<div className="flex flex-col gap-y-3 mt-5">
					{!isOwner && (
						<p className="flex m-auto text-sm text-gray-400">
							Comment will be anonymous to the item owner and other users
						</p>
					)}
					<AddCommentForm
						config={{
							onSubmit: handleAddComment,
						}}
					/>
				</div>

				{!isOwner && (item?.reservation ? unreserveButton() : reserveButton())}
			</div>
		</RoundedRect>
	);
};

export default Item;
