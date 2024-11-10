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
import { EllipsisVertical, PencilLine, Trash2 } from "lucide-react";
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
		return <button onClick={handleReserve}>Reserve</button>;
	};

	const unreserveButton = () => {
		return <button onClick={handleUnreserve}>Unreserve</button>;
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
			<h2>Item</h2>
			<button onClick={handleBack}>Back</button>
			<h3>{item?.title}</h3>
			<p>{item?.description}</p>
			{item?.link && (
				<Button variant={"link"}>
					<NavLink to={`${item.link}`}>{item.link}</NavLink>
				</Button>
			)}
			<h3>Comments</h3>
			{comments?.map((comment) => (
				<Comment key={comment.id} comment={comment} itemId={id} />
			))}
			<AddCommentForm
				config={{
					onSubmit: handleAddComment,
				}}
			/>
			{isOwner && (
				<>
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
								<PencilLine />
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => setIsDeleteDialogOpen(true)}
								className="flex justify-between items-center"
							>
								<span>Delete</span>
								<Trash2 />
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
									submitButtonTitle: "Edit",
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
				</>
			)}
			{!isOwner && (item?.reservation ? unreserveButton() : reserveButton())}
		</RoundedRect>
	);
};

export default Item;
