import { useState, useEffect } from "react";
import WishlistType from "../types/WishlistType";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import { useParams, useNavigate, NavLink } from "react-router-dom";

const Wishlist = () => {
    const [wishlist, setWishlist] = useState<WishlistType>();
    const [items, setItems] = useState<any[]>([]);
    const { id } = useParams();
    const navigate = useNavigate();

    const { data, isSuccess } = useQuery({
        queryKey: [id, "wishlist"],
        queryFn: () => axiosInstance.get(`wishlist/${id}`),
    });

    const { data: itemData, isSuccess: isSuccessItems } = useQuery({
        queryKey: [id, "items"],
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

    const Item = (item: any) => {
        return (
            <div key={item.id}>
                <NavLink to={`/item/${item.id}`}>
                    {item.title}
                </NavLink>
            </div>
        );
    }

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <>
            <h2>Wishlist</h2>
            <button onClick={handleBack}>Back</button>
            <p>{wishlist?.title}</p>
            <p>{wishlist?.description}</p>
            {items?.map(item => Item(item))}
        </>
    );
};

export default Wishlist;