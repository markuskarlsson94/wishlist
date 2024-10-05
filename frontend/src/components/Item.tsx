import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom"
import axiosInstance from "../axiosInstance";
import ItemType from "../types/ItemType";
import { useAuth } from "../contexts/AuthContext";

const Item = () => {
    const [item, setItem] = useState<ItemType>();
    const [isOwner, setIsOwner] = useState<boolean>();
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { userId } = useAuth();

    const { data, isSuccess } = useQuery({
        queryKey: ["item", id],
        queryFn: () => axiosInstance.get(`item/${id}`),
    });

    useEffect(() => {
        if (isSuccess) {
            setItem(data.data.item);
        }
    }, [data, isSuccess]);

    const { data: dataOwner, isSuccess: isSuccessOwner } = useQuery({
        queryKey: ["itemOwner", id],
        queryFn: () => axiosInstance.get(`item/${id}/owner`),
    });

    useEffect(() => {
        if (isSuccessOwner) {
            setIsOwner(dataOwner.data.owner === userId);
        }
    }, [dataOwner, isSuccessOwner]);

    const deleteItem = async () => {
        await axiosInstance.delete(`/item/${id}`);
        queryClient.invalidateQueries({ queryKey: ["items", id] });

        if (item?.wishlist) {
            navigate(`/wishlist/${item.wishlist}`);
        }
    };

    const deleteItemMutation = useMutation({
        mutationFn: deleteItem,
    });

    const handleDelete = () => {
        deleteItemMutation.mutate();
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