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
import ItemDialog from "./ItemDialog";
import { Button } from "./ui/button";

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
				<div>
					<NavLink to={`${item.link}`}>{item.link}</NavLink>
				</div>
			)}
			<h3>Comments</h3>
			{comments?.map((comment) => (
				<Comment key={comment.id} comment={comment} itemId={id} />
			))}
			{AddCommentForm(handleAddComment)}
			{isOwner && (
				<>
					<ItemDialog
						config={{
							title: "Edit item",
							submitButtonTitle: "Edit",
							onSubmit: onSubmitItem,
							values: itemValues,
						}}
					/>
					<Button variant="secondary" onClick={handleDelete}>
						Delete item
					</Button>
				</>
			)}
			{!isOwner && (item?.reservation ? unreserveButton() : reserveButton())}
		</RoundedRect>
	);
};

export default Item;
