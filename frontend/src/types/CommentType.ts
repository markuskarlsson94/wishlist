type CommentType = {
    id: number,
    comment: string,
    createdAt: Date,
    updatedAt: Date,
    user?: number,
    anonymizedUserId?: number,
    isItemOwner: boolean,
    isOwnComment: boolean,
    isAdmin: boolean,
};

export default CommentType;