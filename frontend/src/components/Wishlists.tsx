import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import { useAuth } from "../contexts/AuthContext";
import WishlistType from "../types/WishlistType";

const Wishlists = () => {
    const [wishlists, setWishlists] = useState<WishlistType[]>([]);
    const { userId } = useAuth();
    const navigate = useNavigate();
    
    const { data, isSuccess } = useQuery({
        queryKey: ["wishlists", userId],
        queryFn: () => axiosInstance.get(`user/${userId}/wishlists`),
    });

    useEffect(() => {
        if (isSuccess && data) {
            setWishlists(data.data.wishlists);
        }
    }, [data, isSuccess]);

    const handleBack = () => {
        navigate(-1);
    };

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
        </>
    );
};

export default Wishlists;