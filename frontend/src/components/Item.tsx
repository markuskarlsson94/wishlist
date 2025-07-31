import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import NotFound from "./NotFound";
import {
	Breadcrumb,
	BreadcrumbEllipsis,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { useGetWishlist } from "@/hooks/wishlist";
import { useGetUser } from "@/hooks/user";
import ProfilePicture from "./ProfilePicture";
import UserType from "@/types/UserType";

const Item = () => {
	const [isOwner, setIsOwner] = useState<boolean>(false);
	const params = useParams<{ id: string }>();
	const id = Number(params.id);
	const navigate = useNavigate();
	const { userId } = useAuth();
	const { item, isSuccess, notFound } = useGetItem(id);
	const { wishlist } = useGetWishlist(item?.wishlist);
	const createReservation = useCreateReservation({ userId });
	const deleteReservation = useDeleteReservation({ userId });
	const { reservation } = useGetReservationByItemId(item?.id);
	const { user: reserver } = useGetUser(reservation?.[0]?.user);
	const reservedByCurrentUser = reserver?.id === userId;
	const reservationExists = reservation && reservation?.length > 0;
	const updateItem = useUpdateItem();
	const { comments } = useGetComments(id);
	const addComment = useAddComment({ itemId: id });
	const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
	const [comment, setComment] = useState<string>("");
	const formRef = useRef<HTMLFormElement | null>(null);

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
		if (reservation && item) {
			deleteReservation(reservation[0].id, item.id);
		}
	};

	const handleBack = () => {
		navigate(-1);
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
			<p className="font-medium">
				<span className="flex items-center">
					<NavLink to={`/user/${reserver.id}`}>
						<span className="flex gap-x-2 items-center">
							<ProfilePicture src={reserver.profilePicture} />
							{reserver.firstName} {reserver.lastName}
						</span>
					</NavLink>
					<span className="font-normal ml-1">has reserved this item</span>
				</span>
			</p>
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

	const itemValues: ItemInputType = {
		title: item?.title || "",
		description: item?.description || "",
		link: item?.link || "",
	};

	if (notFound) {
		return <NotFound type="Item" />;
	}

	return (
		<RoundedRect>
			<div className="relative flex items-center justify-between">
				<BackButton onClick={handleBack} />
				<div className="absolute left-1/2 transform -translate-x-1/2 font-medium">
					{wishlist && item && (
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem>
									<BreadcrumbEllipsis />
								</BreadcrumbItem>
								<BreadcrumbSeparator />
								<BreadcrumbItem>
									<BreadcrumbLink asChild>
										<NavLink to={`/wishlist/${wishlist.id}`}>{wishlist.title}</NavLink>
									</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator />
								<BreadcrumbItem className="text-black text-base">{item.title}</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					)}
				</div>
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
				<p>{item?.description}</p>
			</div>
			{item?.link && (
				<Button variant={"link"} className={"w-full whitespace-normal text-left"}>
					<NavLink to={`${item.link}`}>{item.link}</NavLink>
				</Button>
			)}
			<div className="h-6" />
			<div className="flex flex-col gap-y-3">
				{item && comments.map((comment) => <Comment key={comment.id} comment={comment} item={item} />)}
				<div className="flex flex-col gap-y-3 mt-5">
					{!isOwner && (
						<p className="flex m-auto text-sm text-gray-400">Your comment will be anonymous to all users</p>
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
				<div className="flex flex-row">
					{reserver && !reservedByCurrentUser && <ReservationInfo reserver={reserver} />}
					<div className="flex gap-x-2 ml-auto">
						<Button onClick={handleSubmitComment} disabled={comment === ""}>
							Add comment
						</Button>
						{!isOwner && (reservedByCurrentUser ? <UnreserveButton /> : <ReserveButton />)}
					</div>
				</div>
			</div>
		</RoundedRect>
	);
};

export default Item;
