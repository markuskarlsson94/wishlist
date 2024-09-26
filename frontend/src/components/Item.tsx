import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom"
import axiosInstance from "../axiosInstance";
import ItemType from "../types/ItemType";

const Item = () => {
    const [item, setItem] = useState<ItemType>();
    const { id } = useParams();
    const navigate = useNavigate();

    const { data, isSuccess } = useQuery({
        queryKey: ["item", id],
        queryFn: () => axiosInstance.get(`item/${id}`),
    });

    useEffect(() => {
        if (isSuccess) {
            setItem(data.data.item);
        }
    }, [data, isSuccess]);

    const handleBack = () => {
        navigate(-1);
    }

    return (
        <>
            <h2>Item</h2>
            <button onClick={handleBack}>Back</button>
            <h3>{item?.title}</h3>
            <p>{item?.description}</p>
        </>
    )
};

export default Item;