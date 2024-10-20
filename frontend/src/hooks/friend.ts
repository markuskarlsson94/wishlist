import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";

type FriendResponse = {
    data: {
        friends: number[],
    };
};

export const useGetFriends = (userId: number | undefined) => {
    const { data, isSuccess } = useQuery<FriendResponse>({
        queryKey: ["friends", userId],
        queryFn: () => axiosInstance.get(`/user/${userId}/friends`),
        enabled: !!userId,
    });

    const friends = data?.data.friends || [];

    return {
        friends,
        isSuccess,
    };
};

type UseDeleteFriendConfig = {
    userId: number | undefined,
    onSuccess?: () => void,
    onError?: (error: Error) => void,
};

export const useDeleteFriend = (config?: UseDeleteFriendConfig) => {
    const queryClient = useQueryClient();
    
    const deleteFriendFn = async (userId: number) => {
        await axiosInstance.delete(`user/friend/${userId}`);

        queryClient.invalidateQueries({ queryKey: ["friends", config?.userId] });
    };
    
    const deleteFriendMutation = useMutation({
        mutationFn: deleteFriendFn,
    });
    
    const deleteFriend = (userId: number) => {
        deleteFriendMutation.mutate(userId);
    };

    return deleteFriend;
};