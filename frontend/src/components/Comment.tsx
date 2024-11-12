import { useState } from "react";
import { useDeleteComment, useUpdateComment } from "../hooks/comment";
import CommentType from "../types/CommentType";
import UpdateCommentForm from "../forms/UpdateCommentForm";
import CommentInputType from "../types/CommentInputType";
import { buttonVariants } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import IconButton from "./IconButton";
import { EllipsisVertical } from "lucide-react";
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
import EditIcon from "./icons/EditIcon";
import DeleteIcon from "./icons/DeleteIcon";

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
		ownCommentString = `You${adminString}`;
	} else {
		ownCommentString = isAdmin ? `You${adminString}` : `Anonymous user ${comment.anonymizedUserId} (You)`;
	}

	if (comment.isOwnComment) {
		return (
			<div className="flex justify-between">
				{commentContent(ownCommentString, comment)}
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
		return commentContent("Owner", comment);
	}

	if (comment.isAdmin) {
		return commentContent("Admin", comment);
	}

	return commentContent(`Anonymous user ${comment.anonymizedUserId}`, comment);
};

const commentContent = (title: string, comment: CommentType) => {
	return (
		<div>
			<p className="flex gap-x-2">
				<span className="font-medium">{title}:</span>
				<span className="font-small text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
			</p>
			<div className="ml-4">
				<p>{comment.comment}</p>
			</div>
		</div>
	);
};

export default Comment;
