import db from "../db.js";
import ErrorMessage from "../errors/ErrorMessage.js";
import errorMessages from "../errors/errorMessages.js";
import logger from "../logger.js";
import { adminRole } from "../roles.js";
import { publicType, allTypes, hiddenType, friendType } from "../wishlistTypes.js";
import { PostgresError } from "pg-error-enum";
import { canManageUser, usersAreFriends } from "./userService.js";

const wishlistService = {
    add: async (user, userId, title, description, type = publicType()) => {
        if (user.id !== userId) {
            if (user.role !== adminRole()) {
                throw new ErrorMessage(errorMessages.unauthorizedToAddWishlist);
            }
        }

        try {
            return (await db.wishlist.add(userId, title, description, type));
        } catch (error) {
            logger.error(error.message);
            throw new ErrorMessage(errorMessages.unableToCreateWishlist);
        }
    },

    remove: async (user, id) => {
        if (!(await canManageWishlist(user, id))) {
            throw new ErrorMessage(errorMessages.unauthorizedToDeleteWishlist);
        }
        
        try {
            await db.wishlist.remove(id);
            logger.info(`Wishlist (id: ${id}) removed`);
        } catch (error) {
            logger.error(error.message);
            throw new ErrorMessage(errorMessages.serverError);
        }
    },

    getItems: async (user, id) => {
        if (!(await canViewWishlist(user, id))) {
            throw new ErrorMessage(errorMessages.wishlistNotFound);
        }

        const items = await db.wishlist.item.getByWishlistId(id);
            const filteredItems = [];

            for (const item of items) {
                try {
                    filteredItems.push(await createFilteredWishlistItem(user, item));
                } catch (error) {}
            };

        return filteredItems;
    },

    getById: async (user, id) => {
        if (!(await canViewWishlist(user, id))) {
            throw new ErrorMessage(errorMessages.wishlistNotFound);
        }
        
        try {
            return (await db.wishlist.getById(id));
        } catch (error) {
            logger.error(error.message);
            throw new ErrorMessage(errorMessages.serverError);
        }
    },

    getByUserId: async (user, userId) => {
        try {
            let wishlists = await db.wishlist.getByUserId(userId);
            
            const results = await Promise.all(wishlists.map(async (wishlist) => {
                const canView = await canViewWishlist(user, wishlist.id);
                return { wishlist, canView };
            }));
              
            wishlists = results.filter(result => result.canView).map(result => result.wishlist);

            return wishlists;
        } catch (error) {
            logger.error(error.message);
            throw new ErrorMessage(errorMessages.unableToGetWishlistsForUser);
        }
    },

    getAll: async () => {
        try {
            return (await db.wishlist.getAll());
        } catch (error) {
            logger.error(error.message);
            throw new ErrorMessage(errorMessages.serverError);
        }
    },

    getTypes: async () => {
        try {
            return (await db.wishlist.getTypes());
        } catch (error) {
            logger.error(error.message);
            throw new ErrorMessage(errorMessages.serverError);
        }
    },

    getType: async (user, id) => {
        if (!(await canViewWishlist(user, id))) {
            throw new ErrorMessage(errorMessages.wishlistNotFound);
        }

        try {
            return (await db.wishlist.getType(id));
        } catch (error) {
            logger.error(error.message);
            throw new ErrorMessage(errorMessages.serverError);
        }
    },

    update: async (user, wishlistId, data) => {
        if (!(await canViewWishlist(user, wishlistId))) {
            throw new ErrorMessage(errorMessages.wishlistNotFound);
        }

        if (!(await canManageWishlist(user, wishlistId))) {
            throw new ErrorMessage(errorMessages.unauthorizedToUpdateWishlist);
        }

        if (data.type && !allTypes().includes(data.type)) {
            throw new ErrorMessage(errorMessages.wishlistTypeNotFound);            
        }

        const { id, owner, createdAt, updatedAt, ...rest } = data;
        if (Object.keys(rest).length === 0) return;

        await db.wishlist.update(wishlistId, rest);
    },

    item: {
        add: async (user, wishlist, title, description, amount = 1) => {
            if (!(await canViewWishlist(user, wishlist))) {
                throw new ErrorMessage(errorMessages.wishlistNotFound);
            }

            if (!(await canManageWishlist(user, wishlist))) {
                throw new ErrorMessage(errorMessages.unauthorizedToUpdateWishlist);
            }

            if (amount < 1) {
                throw new ErrorMessage(errorMessages.unableToAddLessThanOneItem);
            }

            try {
                return (await db.wishlist.item.add(wishlist, title, description, amount));
            } catch (error) {
                logger.error(error.message);
                throw new ErrorMessage(errorMessages.unableToAddItem);
            }
        },

        remove: async (user, id) => {
            if (!(await canViewWishlistItem(user, id))) {
                throw new ErrorMessage(errorMessages.wishlistItemNotFound);
            }

            if (!(await canManageWishlistItem(user, id))) {
                throw new ErrorMessage(errorMessages.unauthorizedToUpdateWishlist);
            }

            await db.wishlist.item.remove(id);
        },

        reserve: async (user, id, amount = 1) => {
            if (!(await canViewWishlistItem(user, id))) {
                throw new ErrorMessage(errorMessages.wishlistItemNotFound);
            }

            if ((await userOwnsItem(user, id))) {
                throw new ErrorMessage(errorMessages.unableToReserveOwnItem);
            }

            if (amount < 1) {
                throw new ErrorMessage(errorMessages.amountToReserveTooSmall);
            }

            const item = await db.wishlist.item.getById(id);
            const reservations = await db.reservation.getByItemId(id);

            let reservedAmount = 0;
            reservations.forEach(r => {
                reservedAmount += r.amount
            });

            if (item.amount < reservedAmount + amount) {
                throw new ErrorMessage(errorMessages.amountToReserveTooLarge);
            }

            let reservation;

            try {
                reservation = await db.wishlist.item.reserve(user.id, id, amount);
            } catch (error) {
                logger.error(error.message);
                
                if (error?.code === PostgresError.UNIQUE_VIOLATION) {
                    throw new ErrorMessage(errorMessages.itemAlreadyReservedByUser);
                }

                throw new ErrorMessage(errorMessages.serverError);
            }
            
            return reservation;
        },

        getById: async (user, id) => {
            if (!(await canViewWishlistItem(user, id))) {
                throw new ErrorMessage(errorMessages.wishlistItemNotFound);
            }

            const item = await db.wishlist.item.getById(id);
            let filteredItem;
            
            try {
                filteredItem = await createFilteredWishlistItem(user, item);
            } catch (error) {
                throw new ErrorMessage(errorMessages.wishlistItemNotFound);
            }

            return filteredItem
        },

        getOwner: async (user, id) => {
            if (!(await canViewWishlistItem(user, id))) {
                throw new ErrorMessage(errorMessages.wishlistItemNotFound);   
            }

            try {
                return (await db.wishlist.item.getOwner(id));
            } catch (error) {
                logger.error(error.message);
                throw new ErrorMessage(errorMessages.serverError);
            }
        },

        comment: {
            add: async (user, itemId, userId, comment) => {
                if (!(await canViewWishlistItem(user, itemId))) {
                    throw new ErrorMessage(errorMessages.wishlistItemNotFound);
                }

                if (!canManageUser(user, userId)) {
                    throw new ErrorMessage(errorMessages.unauthorizedToAddComment);
                }

                try {
                    return (await db.wishlist.item.comment.add(itemId, userId, comment));
                } catch (error) {
                    logger.error(error.message);
                    throw new ErrorMessage(errorMessages.unableToAddComment);
                }
            },
            
            update: async (user, commentId, comment) => {
                if (!(await canManageComment(user, commentId))) {
                    throw new ErrorMessage(errorMessages.unauthorizedToUpdateComment);
                }

                try {
                    await db.wishlist.item.comment.update(commentId, comment);
                } catch (error) {
                    logger.error(error.message);
                    throw new ErrorMessage(errorMessages.unableToUpdateComment);
                }
            },

            remove: async (user, commentId) => {
                if (!(await canManageComment(user, commentId))) {
                    throw new ErrorMessage(errorMessages.unauthorizedToRemoveComment);
                }

                try {
                    await db.wishlist.item.comment.remove(commentId);
                } catch (error) {
                    logger.error(error.message);
                    throw new ErrorMessage(errorMessages.unableToRemoveComment);
                }
            },

            removeByUserId: async (user, userId) => {
                if (!(await canManageComment(user, commentId))) {
                    throw new ErrorMessage(errorMessages.unauthorizedToUpdateComment);
                }

                try {
                    await db.wishlist.item.comment.removeByUserId(userId);
                } catch (error) {
                    logger.error(error.message);
                    throw new ErrorMessage(errorMessages.unableToUpdateComment);
                }
            },

            getById: async (user, id) => {
                if (!(await canViewComment(user, id))) {
                    throw new ErrorMessage(errorMessages.commentNotFound);
                }

                try {
                    return (await db.wishlist.item.comment.getById(id));
                } catch (error) {
                    logger.error(error.message);
                    throw new ErrorMessage(errorMessages.unableToGetComments);
                }
            },

            getByItemId: async (user, itemId) => {
                if (!(await canViewWishlistItem(user, itemId))) {
                    throw new ErrorMessage(errorMessages.unauthorizedToGetComments);
                }

                const itemOwner = await db.wishlist.item.getOwner(itemId);

                try {
                    const comments = await db.wishlist.item.comment.getByItemId(itemId);
                    const commentMap = new Map();
                    let id = 1;

                    return comments.map(comment => {
                        const ownComment = comment.user === user.id;
                        let anonymizedUserId;
                        
                        if (!ownComment) {
                            if (comment.user === itemOwner) {
                                comment.isItemOwner = true;
                            } else {   
                                anonymizedUserId = commentMap.get(comment.user); 
                                
                                if (anonymizedUserId === undefined) {
                                    anonymizedUserId = id++;
                                    commentMap.set(comment.user, anonymizedUserId);
                                }

                                comment.anonymizedUserId = anonymizedUserId;
                            }
                        } else {
                            comment.isOwnComment = true;
                        }
                        
                        if (user.role !== adminRole()) {
                            delete comment.user;
                        }

                        return comment;
                    });
                } catch (error) {
                    logger.error(error.message);
                    throw new ErrorMessage(errorMessages.unableToGetComments);
                }
            },
        },
    },

    reservation: {
        getById: async (user, id) => {
            if (!(await canViewReservation(user, id))) {
                throw new ErrorMessage(errorMessages.reservationNotFound);
            }

            return (await db.reservation.getById(id));
        },

        getByUserId: async (user, id) => {
            if (!(await canViewUser(user, id))) {
                throw new ErrorMessage(errorMessages.reservationNotFound);
            }

            return (await db.reservation.getByUserId(id));
        },

        getByItemId: async (user, id) => {
            if (user.role !== adminRole()) {
                throw new ErrorMessage(errorMessages.unauthorizedToViewReservations);
            }

            return db.reservation.getByItemId(id);
        },

        getByUserIdAndItemId: async (user, userId, itemId) => {
            const userOk = await canViewUser(user, userId);
            const itemOk = await canViewWishlistItem(user, itemId);

            if (!userOk || !itemOk) {
                throw new ErrorMessage(errorMessages.reservationNotFound);
            }

            const reservation = await db.reservation.getByUserIdAndItemId(userId, itemId);

            if (!reservation) {
                return undefined;
            }

            if (!(await canViewReservation(user, reservation.id))) {
                throw new ErrorMessage(errorMessages.reservationNotFound);
            }

            return reservation;
        },

        clearByUserId: async (user, userId) => {
            if (!canManageUser(user, userId)) {
                throw new ErrorMessage(errorMessages.unauthorizedToClearReservations);
            }

            await db.reservation.clearByUserId(userId);
        },

        remove: async (user, id) => {
            if (!(await canViewReservation(user, id))) {
                throw new ErrorMessage(errorMessages.reservationNotFound);
            }

            if (!(await canManageReservation(user, id))) {
                throw new ErrorMessage(errorMessages.unauthorizedToRemoveReservation);
            }

            await db.reservation.remove(id);
        }
    }
};

const canManageWishlist = async (user, wishlistId) => {
    if (!user || !wishlistId) return false;

    if (user.role === adminRole()) return true;
    const owner = await db.wishlist.getOwner(wishlistId);
    return user.id === owner;
};

const canViewWishlist = async (user, wishlistId) => {
    if (!user || !wishlistId) return false;

    const type = await db.wishlist.getType(wishlistId) ?? hiddenType();
    if (user.role === adminRole() || type === publicType()) return true;
    
    const owner = await db.wishlist.getOwner(wishlistId);
    
    if (type === friendType()) {
        if (user.id === owner) return true;
        return (await usersAreFriends(user.id, owner));
    }
    
    if (user.id === owner) return true;

    return false;
};

const canViewWishlistItem = async (user, itemId) => {
    const wishlistId = await db.wishlist.item.getWishlist(itemId);
    return (await canViewWishlist(user, wishlistId));
};

const canManageWishlistItem = async (user, itemId) => {
    const wishlistId = await db.wishlist.item.getWishlist(itemId);
    return (await canManageWishlist(user, wishlistId));
};

const canViewReservation = async (user, reservationId) => {
    const userId = await db.reservation.getUser(reservationId);
    return (user.role === adminRole() || user.id === userId);
};

const canManageReservation = async (user, reservationId) => {
    const userId = await db.reservation.getUser(reservationId);
    return (user.role === adminRole() || user.id === userId);
};

const canViewUser = async (user, userId) => {
    if (!user || !userId) return false;
    return (user.role === adminRole() || user.id === userId);
};

const canViewComment = async (user, commentId) => {
    const itemId = await db.wishlist.item.comment.getItem(commentId);
    if (itemId === undefined) return false;
    return (await canViewWishlistItem(user, itemId));
};

const canManageComment = async (user, commentId) => {
    if (user.role === adminRole()) return true;

    const comment = await db.wishlist.item.comment.getById(commentId);
    return comment?.user === user.id;
};

const userOwnsItem = async (user, itemId) => {
    if (!user || !itemId) return false;

    const owner = await db.wishlist.item.getOwner(itemId);
    return user.id === owner;
};

const userHasReservedItem = async (user, itemId) => {
    if (!user || !itemId) return false;

    const reservation = await db.reservation.getByUserIdAndItemId(user.id, itemId);
    return reservation !== undefined;
};

const createFilteredWishlistItem = async (user, item) => {
    const isAdmin = user.role === adminRole();
    
    if (!isAdmin && (await userOwnsItem(user, item.id))) {
        return item;
    }
    
    const reservations = await db.reservation.getByItemId(item.id);
    let reservedAmount = 0;
    
    reservations.forEach(r => {
        reservedAmount += r.amount;
    });
    
    const reservedByUser = await userHasReservedItem(user, item.id);

    if (reservedAmount >= item.amount && !reservedByUser && !isAdmin) {
        throw new Error(errorMessages.amountToReserveTooLarge.message);
    }

    const obj = {
        ...item,
        amount: item.amount - reservedAmount,
    };

    if (isAdmin) {
        obj.originalAmount = item.amount;
    }

    return obj;
};

export default wishlistService;