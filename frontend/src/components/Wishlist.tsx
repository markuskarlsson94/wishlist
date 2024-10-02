import { useState, useEffect } from "react";
import WishlistType from "../types/WishlistType";
import ItemInputType from "../types/ItemInputType";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import CreateItemForm from "../forms/CreateItemForm";

const Wishlist = () => {
    const [wishlist, setWishlist] = useState<WishlistType>();
    const [items, setItems] = useState<any[]>([]);
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [showCreate, setShowCreate] = useState<boolean>(false);

    const { data, isSuccess } = useQuery({
        queryKey: ["wishlist", id],
        queryFn: () => axiosInstance.get(`wishlist/${id}`),
    });

    const { data: itemData, isSuccess: isSuccessItems } = useQuery({
        queryKey: ["items", id],
        queryFn: () => axiosInstance.get(`wishlist/${id}/items`),
    });

    useEffect(() => {
        if (isSuccess) {
            setWishlist(data.data.wishlist);
        }
    }, [data, isSuccess]);

    useEffect(() => {
        if (isSuccessItems) {
            setItems(itemData.data.items);
        }
    }, [itemData, isSuccessItems]);

    const deleteWishlist = async () => {
        await axiosInstance.delete(`/wishlist/${id}`);
        queryClient.invalidateQueries({ queryKey: ["wishlists"] });
        navigate("/wishlists");
    };

    const deleteWishlistMutation = useMutation({
        mutationFn: deleteWishlist,
    });

    const createItem = async (input: ItemInputType) => {
        await axiosInstance.post("/item", {
            ...input,
            wishlistId: id,
        });

        queryClient.invalidateQueries({ queryKey: ["items", id] });
    };

    const createItemMutation = useMutation({
        mutationFn: createItem,
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

    const handleAddItem = (input: ItemInputType) => {
        console.log(1);
        createItemMutation.mutate(input);
        setShowCreate(false);
    };

    const handleCancel = () => {
        console.log("cancel");
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
            {showCreate ?
                CreateItemForm(handleAddItem, handleCancel) :
                <button onClick={handleCreateNew}>Add item</button>
            }
            <button onClick={handleDelete}>Delete wishlist</button>
        </>
    );
};

export default Wishlist;