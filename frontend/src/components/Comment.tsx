import React from "react";
import { useState } from "react";
import { useDeleteComment, useUpdateComment } from "../hooks/comment";
import CommentType from "../types/CommentType";
import UpdateCommentForm from "../forms/UpdateCommentForm";
import CommentInputType from "../types/CommentInputType";
import { Button, buttonVariants } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
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
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import ReactTimeAgo from "react-time-ago";
import ItemType from "@/types/ItemType";
import { useGetUser } from "@/hooks/user";
import { Badge } from "./ui/badge";
import ProfilePicture from "./ProfilePicture";

const Comment = ({ comment, item }: { comment: CommentType; item: ItemType }) => {
	const { id: itemId, owner } = item;
	const { user } = useGetUser(owner);
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

	const CommentOptions = () => {
		return (
			<div>
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

	const DateComponent = ({ comment }: { comment: CommentType }) => {
		const edited = comment.createdAt !== comment.updatedAt;

		const DateWrapperWithComment = (props: any) => <DateWrapper {...props} comment={comment} />;

		return (
			<span className="font-medium text-sm text-gray-500">
				<ReactTimeAgo
					date={new Date(comment.createdAt)}
					tooltip={false}
					wrapperComponent={DateWrapperWithComment}
				/>
				{edited && <span>*</span>}
			</span>
		);
	};

	const DateWrapper = React.forwardRef<HTMLDivElement, { comment: CommentType; children: React.ReactNode }>(
		({ comment, children }, ref) => {
			const edited = comment.createdAt !== comment.updatedAt;
			const createdAt = new Date(comment.createdAt).toUTCString();
			const updatedAt = new Date(comment.updatedAt).toUTCString();
			const tooltip = edited ? `${createdAt}, Edited on ${updatedAt}` : createdAt;

			return (
				<Tooltip ref={ref} tooltip={tooltip}>
					{children}
				</Tooltip>
			);
		},
	);

	const CommentProfilePicture = ({ comment }: { comment: CommentType }) => {
		if (comment.isAdmin) return <></>;

		if (comment.isItemOwner) {
			return <ProfilePicture src={user?.profilePicture ?? undefined} />;
		}

		return <ProfilePicture src={undefined} />;
	};

	const CommentContent = ({ title, comment }: { title: string; comment: CommentType }) => {
		return (
			<Card className="relative">
				<CardHeader>
					<CardTitle>
						<div className="absolute right-3 top-2">{comment.isOwnComment && <CommentOptions />}</div>
						<div className="flex justify-between">
							<div className="flex gap-x-3 items-center">
								<CommentProfilePicture comment={comment} />
								<p>{title}</p>
								<Badge variant={"secondary"}>
									<DateComponent comment={comment} />
								</Badge>
							</div>
						</div>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="">
						<p>{comment.comment}</p>
					</div>
				</CardContent>
			</Card>
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
		return <CommentContent title={ownCommentString} comment={comment} />;
	}

	if (comment.isItemOwner) {
		return <CommentContent title={`${user?.firstName} ${user?.lastName}`} comment={comment} />;
	}

	if (comment.isAdmin) {
		return <CommentContent title={"Admin"} comment={comment} />;
	}

	return <CommentContent title={`Anonymous user ${comment.anonymizedUserId}`} comment={comment} />;
};

export default Comment;
