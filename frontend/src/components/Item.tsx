import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useGetItem, useDeleteItem, useUpdateItem } from "../hooks/item";
import { useCreateReservation, useDeleteReservation, useGetReservationByItemId } from "../hooks/reservation";
import ItemInputType from "../types/ItemInputType";
import { NavLink } from "react-router-dom";
import { useAddComment, useGetComments } from "../hooks/comment";
import AddCommentForm from "../forms/AddCommentForm";
import CommentInputType from "../types/CommentInputType";
import Comment from "./Comment";
import RoundedRect from "./RoundedRect";
import { Button, buttonVariants } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Check, Copy, EllipsisVertical } from "lucide-react";
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
import EditIcon from "./icons/EditIcon";
import DeleteIcon from "./icons/DeleteIcon";
import NotFound from "./NotFound";
import { useGetWishlist } from "@/hooks/wishlist";
import { useGetUser } from "@/hooks/user";
import ProfilePicture from "./ProfilePicture";
import UserType from "@/types/UserType";
import Navbar from "./Navbar";
import { useDeleteNotificationsByItem } from "@/hooks/notification";
import LoadingSpinner from "./LoadingSpinner";

const Item = () => {
	const [isOwner, setIsOwner] = useState<boolean>(false);
	const params = useParams<{ id: string }>();
	const id = Number(params.id);
	const navigate = useNavigate();
	const { userId } = useAuth();
	const { item, isSuccess, isLoading, notFound } = useGetItem(id);
	const { wishlist } = useGetWishlist(item?.wishlist);
	const createReservation = useCreateReservation({ userId });
	const deleteReservation = useDeleteReservation({ userId });
	const { reservation } = useGetReservationByItemId(item?.id);
	const { user: reserver } = useGetUser(reservation?.[0]?.user);
	const { user: itemOwner } = useGetUser(item?.owner);
	const reservedByCurrentUser = reserver?.id === userId;
	const reservationExists = reservation && reservation?.length > 0;
	const updateItem = useUpdateItem();
	const { comments } = useGetComments(id);
	const addComment = useAddComment({ itemId: id });
	const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
	const [comment, setComment] = useState<string>("");
	const formRef = useRef<HTMLFormElement | null>(null);
	const deleteNotificationsByItem = useDeleteNotificationsByItem({ userId });
	const [copied, setCopied] = useState(false);

	const onDeleteItem = () => {
		if (item?.wishlist) {
			navigate(`/wishlist/${item.wishlist}`, { replace: true });
		}
	};

	const { deleteItem } = useDeleteItem({ onSuccess: onDeleteItem });

	useEffect(() => {
		if (isSuccess) {
			setIsOwner(item?.owner === userId);
			if (item) deleteNotificationsByItem(item.id);
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
		if (reservation && item) {
			deleteReservation(reservation[0].id, item.id);
		}
	};

	const ReserveButton = () => {
		return (
			<Button disabled={reservationExists} onClick={handleReserve}>
				Reserve
			</Button>
		);
	};

	const UnreserveButton = () => {
		return <Button onClick={handleUnreserve}>Unreserve</Button>;
	};

	const ReservationInfo = ({ reserver }: { reserver: UserType }) => {
		return (
			<div className="flex gap-x-2 items-center">
				{reservedByCurrentUser ? (
					<>
						<ProfilePicture src={reserver.profilePicture} />
						<div className="flex flex-col">
							<p> You have reserved this item</p>
							<p className="text-sm text-gray-400 break-all">
								{itemOwner?.firstName} can't see your reservation
							</p>
						</div>
					</>
				) : (
					<>
						<NavLink to={`/user/${reserver.id}`}>
							<ProfilePicture src={reserver.profilePicture} />
						</NavLink>
						<div className="flex flex-col">
							<p>
								<NavLink to={`/user/${reserver.id}`}>
									<span className="font-medium break-all">
										{reserver.firstName} {reserver.lastName}
									</span>
								</NavLink>
								<span> has reserved this item</span>
							</p>
							<p className="text-sm text-gray-400 break-all">
								{itemOwner?.firstName} can't see this reservation
							</p>
						</div>
					</>
				)}
			</div>
		);
	};

	const handleAddComment = (comment: CommentInputType) => {
		addComment(comment);
	};

	const onSubmitItem = (input: ItemInputType) => {
		if (item) updateItem(item.id, input);
		setIsEditDialogOpen(false);
	};

	const handleSubmitComment = () => {
		if (formRef.current) {
			formRef.current.submit();
			setComment("");
		}
	};

	const handleCopy = () => {
		if (copied) return;

		if (item) navigator.clipboard.writeText(item.link || "");

		setCopied(true);

		setTimeout(() => {
			setCopied(false);
		}, 3000);
	};

	const itemValues: ItemInputType = {
		title: item?.title || "",
		description: item?.description || "",
		link: item?.link || "",
	};

	if (notFound) {
		return <NotFound type="Item" />;
	}

	const breadcrumbProps = () => {
		return isOwner
			? {
					breadcrumbs: [
						{ title: "My Wishlists", link: `/user/${userId}/wishlists` },
						{ title: wishlist?.title, link: `/wishlist/${wishlist?.id}` },
						{ title: item?.title },
					],
					isLoading: !userId || !wishlist || !item,
			  }
			: {
					breadcrumbs: [
						{ title: itemOwner?.firstName, link: `/user/${item?.owner}`, userId: itemOwner?.id },
						{ title: "Wishlists", link: `/user/${item?.owner}/wishlists` },
						{ title: wishlist?.title, link: `/wishlist/${wishlist?.id}` },
						{ title: item?.title },
					],
					isLoading: !itemOwner || !item || !wishlist,
			  };
	};

	return (
		<div className="flex flex-col gap-y-2">
			<Navbar props={breadcrumbProps()} />
			<RoundedRect>
				{isLoading && <LoadingSpinner className="m-auto" />}
				{isSuccess && item && (
					<>
						<div className="flex items-start justify-between">
							<p className="font-medium break-all pt-[0.3rem]">{item.title}</p>

							{isOwner && (
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

									<Dialog
										open={isEditDialogOpen}
										onOpenChange={() => setIsEditDialogOpen(!isEditDialogOpen)}
									>
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

						<div className="my-3">
							<p className="break-all">{item.description}</p>
						</div>

						{item.link && (
							<div className="flex flex-col gap-y-3">
								<Link to={item?.link} className="block break-all text-blue-500 hover:underline">
									{item?.link}
								</Link>
								<Button variant={"ghost"} onClick={handleCopy} className="ml-auto">
									{copied ? (
										<>
											<Check />
											Link copied
										</>
									) : (
										<>
											<Copy />
											Copy link
										</>
									)}
								</Button>
							</div>
						)}

						{reserver && (
							<div className="mt-6">
								<ReservationInfo reserver={reserver} />
							</div>
						)}

						{item && (
							<div className="flex flex-col gap-y-3 mt-6">
								{comments.map((comment) => (
									<Comment key={comment.id} comment={comment} item={item} />
								))}
								<div className="flex flex-col gap-y-3 mt-5">
									{!isOwner && (
										<p className="flex m-auto text-sm text-gray-400">
											Your comment will be anonymous to all users
										</p>
									)}
									<AddCommentForm
										config={{
											onSubmit: handleAddComment,
											onCommentChange(comment) {
												setComment(comment);
											},
										}}
										ref={formRef}
									/>
								</div>
								<div className="flex">
									<div className="flex gap-x-2 ml-auto">
										<Button onClick={handleSubmitComment} disabled={comment === ""}>
											Add comment
										</Button>
										{!isOwner && (reservedByCurrentUser ? <UnreserveButton /> : <ReserveButton />)}
									</div>
								</div>
							</div>
						)}
					</>
				)}
			</RoundedRect>
		</div>
	);
};

export default Item;
