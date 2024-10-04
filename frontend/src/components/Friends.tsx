import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import { useAuth } from "../contexts/AuthContext";
import UserType from "../types/UserType";

const Friends = () => {
    const [friends, setFriends] = useState<UserType[]>([]);
    const { userId } = useAuth();
    const navigate = useNavigate();

    const { data, isSuccess } = useQuery({
        queryKey: ["friends", userId],
        queryFn: () => axiosInstance.get(`/user/${userId}/friends`),
    });

    useEffect(() => {
        if (isSuccess) {
            setFriends(data.data.friends);
        }
    }, [data, isSuccess])

    const handleBack = () => {
        navigate(-1);
    };

    const Friend = (friend: UserType) => {
        return (
            <div key={friend.id}>
                <NavLink to={`/user/${friend.id}`}>
                    {friend.firstName} {friend.lastName}
                </NavLink>
            </div>
        );
    }

    return (
        <>
            <h2>Friends</h2>
            <button onClick={handleBack}>Back</button>
            {friends.map(friend => Friend(friend))}
        </>
    );
};

export default Friends;