import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import CommentType from "../types/CommentType";

type CommentsResponse = {
	data: {
		comments: CommentType[];
	};
};

type CommentConfig = {
	itemId: number;
	onSuccess?: () => void;
	onError?: (error: Error) => void;
};

export const useGetComments = (itemId: number) => {
	const { data, isSuccess } = useQuery<CommentsResponse>({
		queryKey: commentsQueryKey(itemId),
		queryFn: () => axiosInstance.get(`/item/${itemId}/comments`),
		enabled: !!itemId,
	});

	return {
		comments: data?.data.comments,
		isSuccess,
	};
};

export const useAddComment = (config: CommentConfig) => {
	const queryClient = useQueryClient();

	const addCommentFn = async (comment: string) => {
		await axiosInstance.post(`/item/${config.itemId}/comment`, {
			comment,
		});

		invalidateComments(queryClient, config.itemId);
	};

	const addCommentMutation = useMutation({
		mutationFn: addCommentFn,
		onSuccess: () => {
			if (config?.onSuccess) {
				config.onSuccess();
			}
		},
		onError: (error: Error) => {
			if (config?.onError) {
				config.onError(error);
			}
		},
	});

	const addComment = (comment: string) => {
		addCommentMutation.mutate(comment);
	};

	return addComment;
};

export const useDeleteComment = (config: CommentConfig) => {
	const queryClient = useQueryClient();

	const deleteCommentFn = async (id: number) => {
		await axiosInstance.delete(`/comment/${id}`);
		invalidateComments(queryClient, config.itemId);
	};

	const deleteCommentMutation = useMutation({
		mutationFn: deleteCommentFn,
		onSuccess: () => {
			if (config?.onSuccess) {
				config.onSuccess();
			}
		},
		onError: (error: Error) => {
			if (config?.onError) {
				config.onError(error);
			}
		},
	});

	const deleteComment = (id: number) => {
		deleteCommentMutation.mutate(id);
	};

	return deleteComment;
};

export const useUpdateComment = (config: CommentConfig) => {
	const queryClient = useQueryClient();

	const updateCommentFn = async ({ id, comment }: { id: number; comment: string }) => {
		await axiosInstance.patch(`/comment/${id}`, { comment });
		invalidateComments(queryClient, config.itemId);
	};

	const updateCommentMutation = useMutation({
		mutationFn: updateCommentFn,
		onSuccess: () => {
			if (config?.onSuccess) {
				config.onSuccess();
			}
		},
		onError: (error: Error) => {
			if (config?.onError) {
				config.onError(error);
			}
		},
	});

	const updateComment = (id: number, comment: string) => {
		updateCommentMutation.mutate({ id, comment });
	};

	return updateComment;
};

const commentsQueryKey = (itemId: number) => {
	return ["comments", itemId];
};

const invalidateComments = (queryClient: QueryClient, itemId: number) => {
	queryClient.invalidateQueries({ queryKey: commentsQueryKey(itemId) });
};
