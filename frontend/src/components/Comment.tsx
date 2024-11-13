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
import Tooltip from "./Tooltip";

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

	const commentOptions = () => {
		return (
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

				<AlertDialog open={isDeleteDialogOpen} onOpenChange={() => setIsDeleteDialogOpen(!isDeleteDialogOpen)}>
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
		);
	};

	const commentContent = (title: string, comment: CommentType) => {
		return (
			<div className="bg-gray-100 rounded-md py-2 px-4 relative">
				<div className="absolute right-3">{comment.isOwnComment && commentOptions()}</div>
				<div className="flex justify-between">
					<p className="flex gap-x-2">
						<span className="font-medium">{title}:</span>
						<Tooltip tooltip={new Date(comment.createdAt).toUTCString()}>
							<span className="font-small text-gray-400">
								{new Date(comment.createdAt).toLocaleDateString()}
							</span>
						</Tooltip>
					</p>
				</div>
				<div className="ml-4">
					<p>{comment.comment}</p>
				</div>
			</div>
		);
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
		return commentContent(ownCommentString, comment);
	}

	if (comment.isItemOwner) {
		return commentContent("Owner", comment);
	}

	if (comment.isAdmin) {
		return commentContent("Admin", comment);
	}

	return commentContent(`Anonymous user ${comment.anonymizedUserId}`, comment);
};

export default Comment;
