import { useState } from "react";
import { useDeleteComment, useUpdateComment } from "../hooks/comment";
import CommentType from "../types/CommentType";
import UpdateCommentForm from "../forms/UpdateCommentForm";
import CommentInputType from "../types/CommentInputType";

const Comment = ({ comment, itemId }: { comment: CommentType, itemId: number }) => {
    const deleteComment = useDeleteComment({ itemId });
    const updateComment = useUpdateComment({ itemId });
    const [showUpdate, setShowUpdate] = useState<boolean>(false);

    const handleDelete = () => {
        deleteComment(comment.id);
    };

    const handleShowEdit = () => {
        setShowUpdate(true);
    }

    const handleEdit = (newComment: CommentInputType) => {
        updateComment(comment.id, newComment.comment);
        setShowUpdate(false);
    };

    const handleCancel = () => {
        setShowUpdate(false);
    };

    if (comment.isOwnComment) {
        return (
            <> 
                {showUpdate ? 
                    UpdateCommentForm(comment.comment, handleEdit, handleCancel) :
                    <>
                        <p>
                            You: {comment.comment}
                        </p>
                        <button onClick={handleShowEdit}>Edit</button>
                        <button onClick={handleDelete}>Delete</button>
                    </>
                }
            </>
        );
    }

    if (comment.isItemOwner) {
        return (
            <p>
                Owner: {comment.comment}
            </p>
        );
    }

    return (
        <p>
            Anonymous user {comment.anonymizedUserId}: {comment.comment}
        </p>
    );
};

export default Comment;