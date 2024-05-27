import db from "../db.js";
import ErrorMessage from "../errors/ErrorMessage.js";
import errorMessages from "../errors/errorMessages.js";
import logger from "../logger.js";
import { adminRole } from "../roles.js";

const wishlistService = {
    add: async (userId, title, description) => {
        try {
            return (await db.wishlist.add(userId, title, description));
        } catch (error) {
            logger.error(error.message);
            throw new ErrorMessage(errorMessages.unableToCreateWishlist);
        }
    },

    remove: async (user, id) => {
        try {
            if (!(await canManageWishlist(user, id))) {
                throw new ErrorMessage(errorMessages.unauthorizedToDeleteWishlist);
            }

            await db.wishlist.remove(id);
            logger.info(`Wishlist (id: ${id}) removed`);
        } catch (error) {
            logger.error(error.message);
            throw new ErrorMessage(errorMessages.unauthorizedToDeleteWishlist);
        }
    },

    getById: async (id) => {
        try {
            return (await db.wishlist.getById(id));
        } catch (error) {
            logger.error(error.message);
            throw new ErrorMessage(errorMessages.wishlistNotFound);
        }
    },

    getByUserId: async (userId) => {
        try {
            return (await db.wishlist.getByUserId(userId));
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
};

const canManageWishlist = async (user, wishlistId) => {
    if (user.role === adminRole()) return true;
    const owner = await db.wishlist.getOwner(wishlistId);
    return user.id === owner;
};

export default wishlistService;