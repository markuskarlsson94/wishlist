import ErrorMessage from "../errors/ErrorMessage.js";
import { passwordsMatching } from "../utilities/password.js";
import logger from "../logger.js";
import db from "../db.js";
import userRoles from "../roles.js";

const userService = {
    getAll: async () => {
        return (await db.user.getAll());
    },

    getById: async (id) => {
        try {
            return await db.user.getById(id);
        } catch (error) {
            logger.error(error.message);
            throw new ErrorMessage(500, "Server error");
        }
    },

    getByUsername: async (username) => {
        try {
            return await db.user.getByUsername(username);
        } catch (error) {
            logger.error(error.message);
            throw new ErrorMessage(500, "Server error");
        }
    },

    add: async (username, email, plaintextPassword, role = userRoles.CUSTOMER) => {
        try {
            return (await db.user.add(username, email, plaintextPassword, role));
        } catch (error) {
            logger.error(error?.message);
            throw new ErrorMessage(500, "Unable to add new user.");
        }
    },

    remove: async (userId, userToDeleteId) => {
        if (userId !== userToDeleteId) {
            throw new ErrorMessage(401, "Unauthorized to delete other user.");
        }

        const userToDelete = (await db.user.getById(userToDeleteId))?.id;

        // TODO: Admin should be able to delete other user.
        if (userToDelete === undefined) {
            throw new ErrorMessage(400, "User for deletion not found.");
        } else {
            await db.user.remove(userToDelete);
        }
    },

    exists: async (username, email) => {
        try {
            return (await db.user.exists(username, email));
        } catch (error) {
            logger.error(error.message);
            throw new ErrorMessage(500, "Server error.");
        }
    },

    updatePassword: async (userId, oldPassword, newPassword, newPasswordRepeated) => {        
        if (newPassword !== newPasswordRepeated) {
            throw new ErrorMessage(400, "New passwords does not match.");
        }
    
        const userPassword = (await db.user.getById(userId)).password;

        let match = false;
        try {
            match = await passwordsMatching(oldPassword, userPassword);
        } catch (error) {
            logger.debug(error);
            throw new ErrorMessage(500, "Server error.");
        }

        if (match) {
            try {    
                await db.user.updatePassword(userId, newPassword);
            } catch (error) {
                logger.error(error.message);
                throw new ErrorMessage(500, "Server error")
            }
        } else {
            throw new ErrorMessage(400, "old password is incorrect.");
        }
    }
};

export default userService;