import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";

type UserResponse = {
    data: {
        id: number
    };
}

const useUser = () => {
    const { data, ...rest } = useQuery<UserResponse>({
        queryKey: ["user"],
        queryFn: () => axiosInstance.get("/auth/me"),
    });

    return { user: data?.data.id, ...rest };
};

export default useUser;