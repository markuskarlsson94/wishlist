import ErrorMessage from "../errors/ErrorMessage.js";
import { findUserById, getUsers, removeUser, updateUserPassword } from "../users.js";
import { generatePassword, passwordsMatching } from "../utilities/password.js";
import logger from "../logger.js";

const dataService = {
    getUsers: () => {
        return getUsers();
    },

    deleteUser: (userId, userToDeleteId) => {
        if (userId !== userToDeleteId) {
            throw new ErrorMessage(401, "Unauthorized to delete other user.");
        }

        const userToDelete = findUserById(userToDeleteId)?.id;

        // TODO: Admin should be able to delete other user.
        if (userToDelete === undefined) {
            throw new ErrorMessage(400, "User for deletion not found.");
        } else {
            removeUser(userToDelete);
        }
    },

    updatePassword: async (userId, oldPassword, newPassword, newPasswordRepeated) => {        
        if (newPassword !== newPasswordRepeated) {
            throw new ErrorMessage(400, "New passwords does not match.");
        }
    
        const userPassword = findUserById(userId).password;

        let match = false;
        try {
            match = await passwordsMatching(oldPassword, userPassword);
        } catch (error) {
            logger.debug(error);
            throw new ErrorMessage(500, "Server error.");
        }

        if (match) {
            const hashedPassword = await generatePassword(newPassword);
            updateUserPassword(userId, hashedPassword);
        } else {
            throw new ErrorMessage(400, "old password is incorrect.");
        }
    }
};

export default dataService;