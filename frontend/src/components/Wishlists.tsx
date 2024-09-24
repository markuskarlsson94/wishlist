import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import { useAuth } from "../contexts/AuthContext";

type Wishlist = {
    id: number;
    title: string;
    description: string;
    type: number;
    createdAt: string
};

const Wishlists = () => {
    const [wishlists, setWishlists] = useState<Wishlist[]>([]);
    const { userId } = useAuth();
    const navigate = useNavigate();
    
    const { data, isSuccess } = useQuery({
        queryKey: [userId, "wishlists"],
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

    const Wishlist = (wishlist: Wishlist) => {
        return (
            <div>
                <NavLink to={`/wishlist/${wishlist.id}`} key={wishlist.id}>
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