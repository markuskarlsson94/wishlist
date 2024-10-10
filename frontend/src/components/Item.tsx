import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useGetItem, useDeleteItem } from "../hooks/item";

const Item = () => {
    const [isOwner, setIsOwner] = useState<boolean>(false);
    const params = useParams<{ id: string}>();
    const id = Number(params.id);
    const navigate = useNavigate();
    const { userId } = useAuth();
    const { item, isSuccess } = useGetItem(id);

    const onDeleteItem = () => {
        if (item?.wishlist) {
            navigate(`/wishlist/${item.wishlist}`);
        }
    }

    const { deleteItem } = useDeleteItem({ onSuccess: onDeleteItem });

    useEffect(() => {
        if (isSuccess) {
            setIsOwner(item?.owner === userId);
        }
    }, [item, isSuccess]);

    const handleDelete = () => {
        deleteItem(Number(id));
    };

    const handleBack = () => {
        navigate(-1);
    }

    return (
        <>
            <h2>Item</h2>
            <button onClick={handleBack}>Back</button>
            <h3>{item?.title}</h3>
            <p>{item?.description}</p>
            {isOwner && <button onClick={handleDelete}>Delete item</button>}
        </>
    )
};

export default Item;