import { NavLink, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import { useEffect, useState } from "react";
import UserType from "../types/UserType";

const User = () => {
    const [user, setUser] = useState<UserType>();
    const { userId } = useParams();

    const { data, isSuccess } = useQuery({
        queryKey: ["user", userId],
        queryFn: () => axiosInstance.get(`/user/${userId}`),
    });

    useEffect(() => {
        if (isSuccess) {
            setUser(data.data.user);
        }
    }, [data, isSuccess]);

    return (
        <>
            <h2>User</h2>
            <p>{user?.firstName} {user?.lastName}</p>
            <div>
                <NavLink to={`/user/${userId}/wishlists`}>Wishlists</NavLink>
            </div>
            <div>
                <NavLink to={`/user/${userId}/friends`}>Friends</NavLink>
            </div>
        </>
    );
};

export default User;