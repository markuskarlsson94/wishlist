import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import { useAuth } from "../contexts/AuthContext";
import WishlistType from "../types/WishlistType";
import CreateWishlistForm from "../forms/CreateWishlistForm";
import WishlistInputType from "../types/WishlistInputType";
import useWishlistTypes from "../hooks/useWishlistTypes";

const Wishlists = () => {
    const [wishlists, setWishlists] = useState<WishlistType[]>([]);
    const [showCreate, setShowCreate] = useState<boolean>(false);
    const { userId } = useAuth();
    const navigate = useNavigate();
    const { types } = useWishlistTypes();
    const queryClient = useQueryClient();
    
    const { data, isSuccess } = useQuery({
        queryKey: ["wishlists", userId],
        queryFn: () => axiosInstance.get(`user/${userId}/wishlists`),
    });

    useEffect(() => {
        if (isSuccess && data) {
            setWishlists(data.data.wishlists);
        }
    }, [data, isSuccess]);

    const createWishlist = async(input: WishlistInputType) => {
        await axiosInstance.post("/wishlist", {
            ...input
        });

        queryClient.invalidateQueries({ queryKey: ["wishlists", userId] });
    };

    const mutation = useMutation({
        mutationFn: createWishlist
    });

    const handleBack = () => {
        navigate(-1);
    };

    const handleCreateNew = () => {
        setShowCreate(true);
    };

    const handleAdd = (values: WishlistInputType) => {
        mutation.mutate(values);
        setShowCreate(false);
    };

    const handleCancel = () => {
        setShowCreate(false);
    }

    const Wishlist = (wishlist: WishlistType) => {
        return (
            <div key={wishlist.id}>
                <NavLink to={`/wishlist/${wishlist.id}`}>
                    {wishlist.title}
                </NavLink>
            </div>
        );
    };

    return (
        <>
            <h2>Wishlists</h2>
            <button onClick={handleBack}>Back</button>
            <div>
                {wishlists.map(wishlist => Wishlist(wishlist))}
            </div>
            {showCreate ? 
                CreateWishlistForm(handleAdd, handleCancel, types) :
                <>
                    <button onClick={handleCreateNew}>Create new wishlist</button>
                </>
            }
        </>
    );
};

export default Wishlists;