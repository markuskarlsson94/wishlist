import ErrorMessage from "../errors/ErrorMessage.js";
import { passwordsMatching } from "../utilities/password.js";
import logger from "../logger.js";
import db from "../db.js";
import userRoles from "../roles.js";
import errorMessages from "../errors/errorMessages.js";

const userService = {
    getAll: async () => {
        return (await db.user.getAll());
    },

    getById: async (id) => {
        try {
            return await db.user.getById(id);
        } catch (error) {
            logger.error(error.message);
            throw new ErrorMessage(errorMessages.serverError);
        }
    },
    
    getByEmail: async (email) => {
        try {
            return await db.user.getByEmail(email);
        } catch (error) {
            logger.error(error.message);
            throw new ErrorMessage(errorMessages.serverError);
        }
    },

    add: async (email, firstName, lastName, plaintextPassword, role = userRoles.USER) => {
        try {
            return (await db.user.add(email, firstName, lastName, plaintextPassword, role));
        } catch (error) {
            logger.error(error.message);
            throw new ErrorMessage(errorMessages.unableToAddNewUser);
        }
    },

    remove: async (userId, userToDeleteId) => {
        if (userId !== userToDeleteId) {
            throw new ErrorMessage(errorMessages.unauthorizedToDeleteOtherUser);
        }

        const userToDelete = (await db.user.getById(userToDeleteId))?.id;

        // TODO: Admin should be able to delete other user.
        if (userToDelete === undefined) {
            throw new ErrorMessage(errorMessages.userNotFound);
        } else {
            await db.user.remove(userToDelete);
        }
    },

    exists: async (email) => {
        try {
            return (await db.user.exists(email));
        } catch (error) {
            logger.error(error.message);
            throw new ErrorMessage(errorMessages.serverError);
        }
    },

    updatePassword: async (userId, oldPassword, newPassword, newPasswordRepeated) => {        
        if (newPassword !== newPasswordRepeated) {
            throw new ErrorMessage(errorMessages.passwordsDontMatch);
        }
    
        const userPassword = (await db.user.getById(userId)).password;

        let match = false;
        try {
            match = await passwordsMatching(oldPassword, userPassword);
        } catch (error) {
            logger.error(error.message);
            throw new ErrorMessage(errorMessages.serverError);
        }

        if (match) {
            try {    
                await db.user.updatePassword(userId, newPassword);
            } catch (error) {
                logger.error(error.message);
                throw new ErrorMessage(errorMessages.serverError)
            }
        } else {
            throw new ErrorMessage(errorMessages.oldPasswordIncorrect);
        }
    }
};

export default userService;