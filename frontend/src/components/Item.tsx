import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useGetItem, useDeleteItem } from "../hooks/item";
import { useCreateReservation, useDeleteReservation } from "../hooks/reservation";

const Item = () => {
    const [isOwner, setIsOwner] = useState<boolean>(false);
    const params = useParams<{ id: string }>();
    const id = Number(params.id);
    const navigate = useNavigate();
    const { userId } = useAuth();
    const { item, isSuccess } = useGetItem(id);
    const createReservation = useCreateReservation({ userId });
    const deleteReservation = useDeleteReservation({ userId });

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
        deleteItem(Number(id));
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
        return <button onClick={handleReserve}>Reserve</button>
    };

    const unreserveButton = () => {
        return <button onClick={handleUnreserve}>Unreserve</button>
    };

    return (
        <>
            <h2>Item</h2>
            <button onClick={handleBack}>Back</button>
            <h3>{item?.title}</h3>
            <p>{item?.description}</p>
            {isOwner && <button onClick={handleDelete}>Delete item</button>}
            {!isOwner && (item?.reservation ? unreserveButton() : reserveButton())}
        </>
    );
};

export default Item;