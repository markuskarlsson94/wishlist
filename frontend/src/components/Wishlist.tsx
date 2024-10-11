import { useState, useEffect } from "react";
import ItemInputType from "../types/ItemInputType";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import CreateItemForm from "../forms/CreateItemForm";
import { useAuth } from "../contexts/AuthContext";
import { useCreateItem, useGetItems } from "../hooks/item";
import { useDeleteWishlist, useGetWishlist } from "../hooks/wishlist";

const Wishlist = () => {
    const [isOwner, setIsOwner] = useState<boolean>(false);
    const params = useParams<{ id: string }>();
    const id = Number(params.id);
    const { wishlist, isSuccess } = useGetWishlist(id);
    const { userId } = useAuth();
    const navigate = useNavigate();
    const deleteWishlist = useDeleteWishlist({ onSuccess: () => {
        navigate(`/user/${userId}/wishlists`, { replace: true });
    } });
    const [showCreate, setShowCreate] = useState<boolean>(false);
    const { items } = useGetItems(id);
    const { createItem } = useCreateItem();

    useEffect(() => {
        if (isSuccess) {
            setIsOwner(wishlist?.owner === userId);
        }
    }, [wishlist, isSuccess]);

    const Item = (item: any) => {
        return (
            <div key={item.id}>
                <NavLink to={`/item/${item.id}`}>
                    {item.title}
                </NavLink>
            </div>
        );
    };

    const handleCreateNew = () => {
        setShowCreate(true);
    };

    const handleAddItem = (item: ItemInputType) => {
        if (wishlist) {
            createItem(item, wishlist.id);
        }

        setShowCreate(false);
    };

    const handleCancel = () => {
        setShowCreate(false);
    }

    const handleDelete = () => {
        deleteWishlist(id);
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <>
            <h2>Wishlist</h2>
            <button onClick={handleBack}>Back</button>
            <h3>{wishlist?.title}</h3>
            <p>{wishlist?.description}</p>
            {items?.map(item => Item(item))}
            {isOwner &&
                <>
                    {showCreate ?
                        CreateItemForm(handleAddItem, handleCancel) :
                        <button onClick={handleCreateNew}>Add item</button>
                    }
                    <button onClick={handleDelete}>Delete wishlist</button>
                </>
            }
        </>
    );
};

export default Wishlist;