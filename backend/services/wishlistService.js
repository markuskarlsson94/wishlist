import db from "../db.js";
import ErrorMessage from "../errors/ErrorMessage.js";
import errorMessages from "../errors/errorMessages.js";
import logger from "../logger.js";
import { adminRole } from "../roles.js";
import { publicType, allTypes, hiddenType } from "../wishlistTypes.js";

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

    setType: async (user, id, type) => {
        if (!(await canViewWishlist(user, id))) {
            throw new ErrorMessage(errorMessages.wishlistNotFound);
        }

        if (!(await canManageWishlist(user, id))) {
            throw new ErrorMessage(errorMessages.unauthorizedToUpdateWishlist);
        }

        if (!allTypes().includes(type)) {
            throw new ErrorMessage(errorMessages.wishlistTypeNotFound);            
        }

        try {
            await db.wishlist.setType(id, type);
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


const canViewWishlist = async (user, wishlistId) => {
    const type = await db.wishlist.getType(wishlistId) ?? hiddenType();
    if (user.role === adminRole() || type === publicType()) return true;
    
    const owner = await db.wishlist.getOwner(wishlistId);
    if (user.id === owner) return true;

    return false;
};

export default wishlistService;