import { useQuery } from "@tanstack/react-query"
import axiosInstance from "../axiosInstance";
import UserType from "../types/UserType";

type UserResponse = {
    data: {
        user: UserType,
    },
};

export const useGetUser = (id: number | undefined) => {
    const { data, isSuccess } = useQuery<UserResponse>({
        queryKey: ["user", id],
        queryFn: () => axiosInstance.get(`/user/${id}`),
        enabled: !!id,
    });

    return {
        user: data?.data.user,
        isSuccess,
    };
};