import { useState, useEffect } from "react";
import WishlistType from "../types/WishlistType";
import ItemInputType from "../types/ItemInputType";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import CreateItemForm from "../forms/CreateItemForm";
import { useAuth } from "../contexts/AuthContext";
import { useCreateItem, useGetItems } from "../hooks/item";

const Wishlist = () => {
    const [wishlist, setWishlist] = useState<WishlistType>();
    const [isOwner, setIsOwner] = useState<boolean>(false);
    const params = useParams<{ id: string }>();
    const id = Number(params.id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [showCreate, setShowCreate] = useState<boolean>(false);
    const { userId } = useAuth();
    const { items } = useGetItems(id);
    const { createItem } = useCreateItem();

    const { data, isSuccess } = useQuery({
        queryKey: ["wishlist", id],
        queryFn: () => axiosInstance.get(`wishlist/${id}`),
    });

    useEffect(() => {
        if (isSuccess) {
            const wishlist = data.data.wishlist;
            setWishlist(wishlist);
            setIsOwner(wishlist.owner === userId);
        }
    }, [data, isSuccess]);

    const deleteWishlist = async () => {
        await axiosInstance.delete(`/wishlist/${id}`);
        queryClient.invalidateQueries({ queryKey: ["wishlists"] });
        navigate("/wishlists");
    };

    const deleteWishlistMutation = useMutation({
        mutationFn: deleteWishlist,
    });

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
        deleteWishlistMutation.mutate();
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