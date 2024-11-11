import { useState } from "react";
import { useDeleteComment, useUpdateComment } from "../hooks/comment";
import CommentType from "../types/CommentType";
import UpdateCommentForm from "../forms/UpdateCommentForm";
import CommentInputType from "../types/CommentInputType";
import { buttonVariants } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import IconButton from "./IconButton";
import { EllipsisVertical, PencilLine, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
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

const Comment = ({ comment, itemId }: { comment: CommentType; itemId: number }) => {
	const deleteComment = useDeleteComment({ itemId });
	const updateComment = useUpdateComment({ itemId });
	const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

	const handleDelete = () => {
		deleteComment(comment.id);
	};

	const handleEdit = (newComment: CommentInputType) => {
		updateComment(comment.id, newComment.comment);
		setIsEditDialogOpen(false);
	};

	const isAdmin = comment.isAdmin;
	const adminString = isAdmin ? " (Admin)" : "";
	let ownCommentString;

	if (comment.isItemOwner) {
		ownCommentString = `You${adminString}: ${comment.comment}`;
	} else {
		ownCommentString = isAdmin
			? `You${adminString}: ${comment.comment}`
			: `Anonymous user ${comment.anonymizedUserId} (You): ${comment.comment}`;
	}

	if (comment.isOwnComment) {
		return (
			<div className="flex justify-between">
				<p>{ownCommentString}</p>
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
								<DialogTitle>Edit comment</DialogTitle>
							</DialogHeader>
							<UpdateCommentForm
								config={{
									comment: comment.comment,
									onSubmit: handleEdit,
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
								<AlertDialogTitle>Delete comment</AlertDialogTitle>
								<AlertDialogDescription>
									Are you sure you want to permanently delete this comment?
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
			</div>
		);
	}

	if (comment.isItemOwner) {
		return (
			<p>
				Owner{adminString}: {comment.comment}
			</p>
		);
	}

	if (comment.isAdmin) {
		return <p>Admin: {comment.comment}</p>;
	}

	return (
		<p>
			Anonymous user {comment.anonymizedUserId}: {comment.comment}
		</p>
	);
};

export default Comment;
