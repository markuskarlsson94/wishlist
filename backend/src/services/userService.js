import ErrorMessage from "../errors/ErrorMessage.js";
import { passwordsMatching } from "../utilities/password.js";
import logger from "../logger.js";
import db from "../db.js";
import { userRole } from "../roles.js";
import errorMessages from "../errors/errorMessages.js";
import { adminRole } from "../roles.js";
import { PostgresError } from "pg-error-enum";
import crypto from "crypto";
import z from "zod";
import { sendPasswordResetEmail, sendVerificationEmail } from "../utilities/email.js";
import { removeProfilePicture, uploadProfilePicture } from "../utilities/profilePicture.js";
import sharp from "sharp";

const passwordTokenExpireTime = 1000 * 60 * 60;

const emailSchema = z.object({
	email: z.string().email(),
});

const userService = {
	getAll: async () => {
		try {
			return await db.user.getAll();
		} catch (error) {
			logger.error(error.message);
			throw new ErrorMessage(errorMessages.serverError);
		}
	},

	getById: async (user, userId) => {
		let userToGet;

		try {
			userToGet = await db.user.getById(userId);
		} catch (error) {
			logger.error(error.message);
			throw new ErrorMessage(errorMessages.serverError);
		}

		if (!userToGet) {
			throw new ErrorMessage(errorMessages.userNotFound);
		}

		if (!canViewUser(user, userId)) {
			throw new ErrorMessage(errorMessages.userNotFound);
		}

		return userToGet;
	},

	getByEmail: async (user, email) => {
		let userToGet;

		try {
			userToGet = await db.user.getByEmail(email);
		} catch (error) {
			logger.error(error.message);
			throw new ErrorMessage(errorMessages.serverError);
		}

		if (!userToGet) {
			throw new ErrorMessage(errorMessages.userNotFound);
		}

		if (!canViewUser(user, userToGet.id)) {
			throw new ErrorMessage(errorMessages.userNotFound);
		}

		return userToGet;
	},

	getByFullName: async (name, limit = 10, offset = 0) => {
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

	add: async (user, sendEmail = true) => {
		let { email, firstName, lastName, plaintextPassword, role, profilePicture } = user;

		if (!email || !firstName || !lastName || !plaintextPassword) {
			throw new ErrorMessage(errorMessages.missingUserProperties);
		}

		if (!role) role = userRole();

		if (await userService.exists(email)) {
			throw new ErrorMessage(errorMessages.userAlreadyExists);
		}

		try {
			emailSchema.parse({ email });
		} catch (error) {
			throw new ErrorMessage(errorMessages.invalidEmail);
		}

		const pendingUser = await db.waitlist.getUserByEmail(email);

		if (pendingUser) {
			// TODO: Check if token is expired?
			throw new ErrorMessage(errorMessages.userAlreadyExists);
		}

		const token = crypto.randomBytes(64).toString("hex");

		if (sendEmail) {
			try {
				await sendVerificationEmail(email, token);
			} catch (error) {
				logger.error(error.message);
				throw new ErrorMessage(errorMessages.serverError);
			}
		}

		try {
			await db.waitlist.add(email, firstName, lastName, plaintextPassword, role, profilePicture, token);
			return token;
		} catch (error) {
			logger.error(error.message);
			throw new ErrorMessage(errorMessages.unableToAddNewUser);
		}
	},

	addWithoutVerification: async (user) => {
		let { email, firstName, lastName, plaintextPassword, role, profilePicture } = user;

		if (!email || !firstName || !lastName || !plaintextPassword) {
			throw new ErrorMessage(errorMessages.missingUserProperties);
		}

		if (!role) role = userRole();

		if (await userService.exists(email)) {
			throw new ErrorMessage(errorMessages.userAlreadyExists);
		}

		try {
			return await db.user.add(email, firstName, lastName, plaintextPassword, role, profilePicture);
		} catch (error) {
			logger.error(error.message);
			throw new ErrorMessage(errorMessages.unableToAddNewUser);
		}
	},

	remove: async (user, userToDeleteId) => {
		if (!canManageUser(user, userToDeleteId)) {
			throw new ErrorMessage(errorMessages.unauthorizedToDeleteOtherUser);
		}

		const userToDelete = await db.user.getById(userToDeleteId);

		if (userToDelete === undefined) {
			throw new ErrorMessage(errorMessages.userNotFound);
		} else {
			await removeProfilePicture(user, userToDeleteId);
			await db.user.remove(userToDelete.id);
			logger.info(`User [id = ${userToDelete.id}, email = ${userToDelete.email}] has been removed`);
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

	update: async (user, userId, data) => {
		if (!(await canViewUser(user, userId))) {
			throw new ErrorMessage(errorMessages.userNotFound);
		}

		if (!canManageUser(user, userId)) {
			throw new ErrorMessage(errorMessages.unauthorizedToUpdateUser);
		}

		const googleUser = await isGoogleUser(userId);

		if (googleUser && (data?.firstName || data?.lastName || data?.profilePicture)) {
			throw new ErrorMessage(errorMessages.unauthorizedToUpdateGoogleProfileInfo);
		}

		const { id, email, password, role, createdAt, updatedAt, ...rest } = data;
		if (Object.keys(rest).length === 0) return;

		try {
			await db.user.update(userId, rest);
			logger.info(`User [id = ${userId}] updated`);
		} catch (error) {
			logger.error(error.message);
			throw new ErrorMessage(errorMessages.unableToUpdateUser);
		}
	},

	updatePassword: async (user, userId, passwordCur, passwordNew, passwordNewRepeated) => {
		if (!canManageUser(user, userId)) {
			throw new ErrorMessage(errorMessages.unauthorizedToUpdatePassword);
		}

		if (await isGoogleUser(userId)) {
			throw new ErrorMessage(errorMessages.unauthorizedToUpdateGoogleProfileInfo);
		}

		if (passwordNew !== passwordNewRepeated) {
			throw new ErrorMessage(errorMessages.passwordsDontMatch);
		}

		const userPassword = (await db.user.getById(userId)).password;

		let match = false;
		try {
			match = await passwordsMatching(passwordCur, userPassword);
		} catch (error) {
			logger.error(error.message);
			throw new ErrorMessage(errorMessages.serverError);
		}

		if (match) {
			try {
				await db.user.updatePassword(userId, passwordNew);
				logger.info(`User [id = ${userId}] changed password`);
			} catch (error) {
				logger.error(error.message);
				throw new ErrorMessage(errorMessages.serverError);
			}
		} else {
			throw new ErrorMessage(errorMessages.oldPasswordIncorrect);
		}
	},

	updateProfilePicture: async (user, userId, image) => {
		if (!canManageUser(user, userId)) {
			throw new ErrorMessage(errorMessages.unauthorizedToUpdateProfilePicture);
		}

		if (await isGoogleUser(userId)) {
			throw new ErrorMessage(errorMessages.unauthorizedToUpdateGoogleProfileInfo);
		}

		const resizedImage = await sharp(image.buffer)
			.resize({
				width: 400,
				height: 400,
			})
			.toFormat("jpeg")
			.toBuffer();

		try {
			const url = await uploadProfilePicture(user, userId, resizedImage, "image/jpeg");
			await db.user.update(user.id, { profilePicture: url });
		} catch (error) {
			logger.error(error.message);
			throw new ErrorMessage(errorMessages.serverError);
		}
	},

	removeProfilePicture: async (user, userId) => {
		try {
			await removeProfilePicture(user, userId);
			await db.user.update(user.id, { profilePicture: null });
		} catch (error) {
			logger.error(error.message);
			throw new ErrorMessage(errorMessages.serverError);
		}
	},

	requestPasswordReset: async (email, sendEmail = true) => {
		const token = crypto.randomBytes(64).toString("hex");
		const user = await db.user.getByEmail(email);

		if (await isGoogleUser(user)) {
			return;
		}

		try {
			if (user) {
				await db.passwordToken.add(email, token);

				if (sendEmail) {
					await sendPasswordResetEmail(email, token);
				}

				logger.info(`${email} requested password reset`);
				return token;
			}
		} catch (error) {
			logger.error(error.message);
			throw new ErrorMessage(errorMessages.unableToAddPasswordToken);
		}
	},

	resetPassword: async (token, newPlaintextPassword) => {
		if (!newPlaintextPassword) {
			throw new ErrorMessage(errorMessages.missingPassword);
		}

		const data = await db.passwordToken.getByToken(token);

		if (!data || data.token != token) {
			throw new ErrorMessage(errorMessages.unableToResetPassword);
		}

		const createdAt = new Date(data.createdAt).getTime();

		if (Date.now() > createdAt + passwordTokenExpireTime) {
			db.passwordToken.remove(data.id);
			throw new ErrorMessage(errorMessages.unableToResetPassword);
		}

		const userId = Number(data.user);

		try {
			await db.user.updatePassword(userId, newPlaintextPassword);
			await db.passwordToken.remove(data.id);
			logger.info(`user [id = ${data.id}] updated password`);
		} catch (error) {
			logger.error(error.message);
			throw new ErrorMessage(errorMessages.serverError);
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

export const isGoogleUser = async (id) => {
	const googleId = await db.user.getGoogleId(id);
	return !!googleId;
};

export const canViewUser = async (user, userId) => {
	// TODO: Implement logic when needed
	if (!user || !userId) return false;
	return true;
};

export const canManageUser = (user, userId) => {
	if (!user || !userId) return false;
	return user.role === adminRole() || user.id === userId;
};

export const usersAreFriends = async (user1Id, user2Id) => {
	return await db.user.friend.with(user1Id, user2Id);
};

export default userService;
