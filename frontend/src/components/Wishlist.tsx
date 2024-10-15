import { useState, useEffect } from "react";
import ItemInputType from "../types/ItemInputType";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import CreateItemForm from "../forms/CreateItemForm";
import { useAuth } from "../contexts/AuthContext";
import { useCreateItem, useGetItems } from "../hooks/item";
import { useDeleteWishlist, useGetWishlist, useUpdateWishlist } from "../hooks/wishlist";
import WishlistForm from "../forms/WishlistForm";
import useWishlistTypes from "../hooks/useWishlistTypes";
import WishlistInputType from "../types/WishlistInputType";

const Wishlist = () => {
    const [isOwner, setIsOwner] = useState<boolean>(false);
    const params = useParams<{ id: string }>();
    const id = Number(params.id);
    const { wishlist, isSuccess } = useGetWishlist(id);
    const updateWishlist = useUpdateWishlist();
    const { userId } = useAuth();
    const navigate = useNavigate();
    const deleteWishlist = useDeleteWishlist({ onSuccess: () => {
        navigate(`/user/${userId}/wishlists`, { replace: true });
    } });
    const [showCreateItem, setShowCreateItem] = useState<boolean>(false);
    const [showUpdateWishlist, setShowUpdateWishlist] = useState<boolean>(false);
    const { items } = useGetItems(id);
    const { createItem } = useCreateItem();
    const { types } = useWishlistTypes();

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

    const handleShowCreateItem = () => {
        setShowCreateItem(true);
        setShowUpdateWishlist(false);
    };

    const handleAddItem = (item: ItemInputType) => {
        if (wishlist) {
            createItem(item, wishlist.id);
        }

        setShowCreateItem(false);
    };

    const handleShowUpdateWishlist = () => {
        setShowUpdateWishlist(true);
        setShowCreateItem(false);
    };

    const handleUpdateWishlist = (data: WishlistInputType) => {
        if (wishlist) {
            updateWishlist(wishlist.id, data);
        }

        setShowUpdateWishlist(false);
    };

    const handleDeleteWishlist = () => {
        deleteWishlist(id);
    };

    const handleCancel = () => {
        setShowCreateItem(false);
        setShowUpdateWishlist(false);
    };

    const handleBack = () => {
        navigate(-1);
    };

    const wishlistValues: WishlistInputType = {
        title: wishlist?.title || "",
        description: wishlist?.description || "",
        type: wishlist?.type || types[0]?.id,
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
                    {showCreateItem ?
                        CreateItemForm(handleAddItem, handleCancel) :
                        <button onClick={handleShowCreateItem}>Add item</button>
                    }
                    {showUpdateWishlist ?
                        WishlistForm(wishlistValues, types, handleUpdateWishlist, handleCancel) :
                        <button onClick={handleShowUpdateWishlist}>Update wishlist</button>
                    }
                    <button onClick={handleDeleteWishlist}>Delete wishlist</button>
                </>
            }
        </>
    );
};

export default Wishlist;