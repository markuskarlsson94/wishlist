import ErrorMessage from "../errors/ErrorMessage.js";
import errorMessages from "../errors/errorMessages.js";
import { commentType, friendRequestType } from "../notifications.js";
import { canManageUser } from "./userService.js";
import { canManageWishlistItem } from "./wishlistService.js";
import logger from "../logger.js";
import db from "../db.js";

const notificationService = {
	sendFriendRequestNotification: async (userId, friendRequestId) => {
		try {
			return await db.notification.add(userId, friendRequestType(), { friendRequest: friendRequestId });
		} catch (error) {
			throw new ErrorMessage(errorMessages.unableToAddNotification);
		}
	},

	sendCommentNotification: async (userId, itemId) => {
		try {
			return await db.notification.add(userId, commentType(), { item: itemId });
		} catch (error) {
			logger.error(error.message);
			throw new ErrorMessage(errorMessages.unableToAddNotification);
		}
	},

	getById: async (id) => {
		try {
			return await db.notification.getById(id);
		} catch (error) {
			throw new ErrorMessage(errorMessages.unableToGetNotifcations);
		}
	},

	getByUserId: async (user, id) => {
		if (!canManageUser(user, id)) {
			throw new ErrorMessage(errorMessages.unauthorizedToGetNotification);
		}

		try {
			return await db.notification.getByUserId(id);
		} catch (error) {
			throw new ErrorMessage(errorMessages.unableToGetNotifcations);
		}
	},

	getByUserIdAndItemId: async (user, userId, itemId) => {
		if (!(await canManageWishlistItem(user, itemId))) {
			throw new ErrorMessage(errorMessages.unauthorizedToGetNotification);
		}

		try {
			return await db.notification.getByUserIdAndItemId(userId, itemId);
		} catch (error) {
			throw new ErrorMessage(errorMessages.unableToGetNotifcations);
		}
	},

	getByUserIdAndFriendRequestId: async (user, userId, friendRequestId) => {
		if (!canManageUser(user, userId)) {
			throw new ErrorMessage(errorMessages.unauthorizedToGetNotification);
		}

		try {
			return await db.notification.getByUserIdAndFriendRequestId(userId, friendRequestId);
		} catch (error) {
			throw new ErrorMessage(errorMessages.unableToGetNotifcations);
		}
	},

	remove: async (user, id) => {
		const userId = (await db.notification.getById(id))?.user;

		if (!canManageUser(user, userId)) {
			throw new ErrorMessage(errorMessages.unauthorizedToRemoveNotification);
		}

		try {
			await db.notification.remove(id);
		} catch (error) {
			throw new ErrorMessage(errorMessages.unableToRemoveNotification);
		}
	},

	removeByUserId: async (user, userId) => {
		if (!canManageUser(user, userId)) {
			throw new ErrorMessage(errorMessages.unauthorizedToRemoveNotification);
		}

		try {
			await db.notification.removeByUserId(userId);
		} catch (error) {
			throw new ErrorMessage(errorMessages.unableToRemoveNotification);
		}
	},

	removeByUserIdAndItemId: async (user, userId, itemId) => {
		if (!canManageUser(user, userId)) {
			throw new ErrorMessage(errorMessages.unauthorizedToRemoveNotification);
		}

		try {
			await db.notification.removeByUserAndItem(userId, itemId);
		} catch (error) {
			throw new ErrorMessage(errorMessages.unableToRemoveNotification);
		}
	},

	getTypes: async () => {
		try {
			return await db.notification.getTypes();
		} catch (error) {
			logger.error(error.message);
			throw new ErrorMessage(errorMessages.serverError);
		}
	},
};

export default notificationService;
