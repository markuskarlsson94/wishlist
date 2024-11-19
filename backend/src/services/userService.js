import ErrorMessage from "../errors/ErrorMessage.js";
import { passwordsMatching } from "../utilities/password.js";
import logger from "../logger.js";
import db from "../db.js";
import { userRole } from "../roles.js";
import errorMessages from "../errors/errorMessages.js";
import { adminRole } from "../roles.js";
import { PostgresError } from "pg-error-enum";

const userService = {
	getAll: async () => {
		try {
			return await db.user.getAll();
		} catch (error) {
			logger.error(error.message);
			throw new ErrorMessage(errorMessages.serverError);
		}
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

	getByFullName: async (name, limit = 20, offset = 0) => {
		if (name.length < 3) {
			throw new ErrorMessage(errorMessages.userQueryTooShort);
		}

		try {
			return await db.user.getByFullName(name, limit, offset);
		} catch (error) {
			logger.error(error.message);
			throw new ErrorMessage(errorMessages.unableToGetUsers);
		}
	},

	add: async (email, firstName, lastName, plaintextPassword, role = userRole()) => {
		if (await userService.exists(email)) {
			throw new ErrorMessage(errorMessages.userAlreadyExists);
		}

		try {
			return await db.user.add(email, firstName, lastName, plaintextPassword, role);
		} catch (error) {
			logger.error(error.message);
			throw new ErrorMessage(errorMessages.unableToAddNewUser);
		}
	},

	remove: async (user, userToDeleteId) => {
		if (!canManageUser(user, userToDeleteId)) {
			throw new ErrorMessage(errorMessages.unauthorizedToDeleteOtherUser);
		}

		const userToDelete = (await db.user.getById(userToDeleteId))?.id;

		if (userToDelete === undefined) {
			throw new ErrorMessage(errorMessages.userNotFound);
		} else {
			await db.user.remove(userToDelete);
		}
	},

	exists: async (email) => {
		try {
			return await db.user.exists(email);
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
				throw new ErrorMessage(errorMessages.serverError);
			}
		} else {
			throw new ErrorMessage(errorMessages.oldPasswordIncorrect);
		}
	},

	getUserRoles: async () => {
		try {
			return db.userRoles.getAll();
		} catch (error) {
			logger.error(error.message);
			throw new ErrorMessage(errorMessages.serverError);
		}
	},

	friend: {
		add: async (user, user1Id, user2Id) => {
			// User has to be able to manage one of the user ids
			if (!(canManageUser(user, user1Id) || canManageUser(user, user2Id))) {
				throw new ErrorMessage(errorMessages.unauthorizedToAddFriend);
			}

			if (user1Id === user2Id) {
				throw new ErrorMessage(errorMessages.unableToAddSameUserAsFriend);
			}

			try {
				await db.user.friend.add(user1Id, user2Id);
			} catch (error) {
				logger.error(error.message);

				if (error?.code === PostgresError.UNIQUE_VIOLATION) {
					throw new ErrorMessage(errorMessages.userAlreadyAddedAsFriend);
				}

				throw new ErrorMessage(errorMessages.serverError);
			}
		},

		remove: async (user, user1Id, user2Id) => {
			// TODO: Error when trying to remove non existing user?
			if (!(canManageUser(user, user1Id) || canManageUser(user, user2Id))) {
				throw new ErrorMessage(errorMessages.unauthorizedToRemoveFriend);
			}

			if (user1Id === user2Id) {
				throw new ErrorMessage(errorMessages.unableToRemoveSameUserAsFriend);
			}

			try {
				await db.user.friend.remove(user1Id, user2Id);
			} catch (error) {
				logger.error(error.message);
				throw new ErrorMessage(errorMessages.unableToRemoveFriend);
			}
		},

		getByUserId: async (user, userId) => {
			/* TODO: Should this be added again? 
				if (!canManageUser(user, userId)) {
					if (!(await usersAreFriends(user.id, userId))) {
						throw new ErrorMessage(errorMessages.unauthorizedToViewFriends);
					} 
				}
			*/

			try {
				return await db.user.friend.getByUserId(userId);
			} catch (error) {
				logger.error(error.message);
				throw new ErrorMessage(errorMessages.serverError);
			}
		},

		with: async (user1Id, user2Id) => {
			return await db.user.friend.with(user1Id, user2Id);
		},
	},

	friendRequest: {
		add: async (user, senderId, receiverId) => {
			if (!canManageUser(user, senderId)) {
				throw new ErrorMessage(errorMessages.unauthorizedToCreateFriendRequest);
			}

			if (user.id === receiverId) {
				throw new ErrorMessage(errorMessages.unableToCreateFriendRequestWithSelf);
			}

			if (await usersAreFriends(senderId, receiverId)) {
				throw new ErrorMessage(errorMessages.userAlreadyAddedAsFriend);
			}

			try {
				return await db.user.friendRequest.add(senderId, receiverId);
			} catch (error) {
				logger.error(error.message);
				throw new ErrorMessage(errorMessages.unableToCreateFriendRequest);
			}
		},

		remove: async (user, id) => {
			const request = await db.user.friendRequest.getById(id);

			if (request === undefined) {
				throw new ErrorMessage(errorMessages.unauthorizedToRemoveFriendRequest);
			}

			const { sender, receiver } = request;

			if (!(canManageUser(user, sender) || canManageUser(user, receiver))) {
				throw new ErrorMessage(errorMessages.unauthorizedToRemoveFriendRequest);
			}

			try {
				await db.user.friendRequest.remove(id);
			} catch (error) {
				logger.error(error.message);
				throw new ErrorMessage(errorMessages.unableToRemoveFriendRequest);
			}
		},

		accept: async (user, id) => {
			const request = await db.user.friendRequest.getById(id);

			if (request === undefined) {
				throw new ErrorMessage(errorMessages.unauthorizedToAcceptFriendRequest);
			}

			const { sender, receiver } = request;

			if (!canManageUser(user, receiver)) {
				throw new ErrorMessage(errorMessages.unauthorizedToAcceptFriendRequest);
			}

			try {
				await db.user.friend.add(sender, receiver);
				await db.user.friendRequest.remove(id);
			} catch (error) {
				logger.error(error.message);
				throw new ErrorMessage(errorMessages.unableToAcceptFriendRequest);
			}
		},

		getById: async (user, id) => {
			let request;

			try {
				request = await db.user.friendRequest.getById(id);
			} catch (error) {
				logger.error(error.message);
				throw new ErrorMessage(errorMessages.unableToGetFriendRequest);
			}

			if (request === undefined) {
				throw new ErrorMessage(errorMessages.unauthorizedToGetFriendRequest);
			}

			const { sender, receiver } = request;
			if (!(canManageUser(user, sender) || canManageUser(user, receiver))) {
				throw new ErrorMessage(errorMessages.unauthorizedToGetFriendRequest);
			}

			return request;
		},

		getBySenderId: async (user, id) => {
			if (!canManageUser(user, id)) {
				throw new ErrorMessage(errorMessages.unauthorizedToGetFriendRequests);
			}

			try {
				return await db.user.friendRequest.getBySenderId(id);
			} catch (error) {
				logger.error(error.message);
				throw new ErrorMessage(errorMessages.unableToGetFriendRequests);
			}
		},

		getByReceiverId: async (user, id) => {
			if (!canManageUser(user, id)) {
				throw new ErrorMessage(errorMessages.unauthorizedToGetFriendRequests);
			}

			try {
				return await db.user.friendRequest.getByReceiverId(id);
			} catch (error) {
				logger.error(error.message);
				throw new ErrorMessage(errorMessages.unableToGetFriendRequests);
			}
		},
	},
};

export const canManageUser = (user, userId) => {
	return user.role === adminRole() || user.id === userId;
};

export const usersAreFriends = async (user1Id, user2Id) => {
	return await db.user.friend.with(user1Id, user2Id);
};

export default userService;
