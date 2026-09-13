import ErrorMessage from "../errors/ErrorMessage.js";
import errorMessages from "../errors/errorMessages.js";
import { commentType, friendRequestType, fulfillmentType } from "../notifications.js";
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
			const notifications = await db.notification.getByUserId(id);
			const filteredNotifications = [];

			for (let notification of notifications) {
				const n = await createFilteredNotification(notification);
				filteredNotifications.push(n);
			}

			return filteredNotifications;
		} catch (error) {
			throw new ErrorMessage(errorMessages.unableToGetNotifcations);
		}
	},

	getByUserIdAndItemId: async (user, userId, itemId) => {
		if (!(await canManageWishlistItem(user, itemId))) {
			throw new ErrorMessage(errorMessages.unauthorizedToGetNotification);
		}

		try {
			const notification = await db.notification.getByUserIdAndItemId(userId, itemId);
			const filteredNotification = await createFilteredNotification(notification);
			return filteredNotification;
		} catch (error) {
			throw new ErrorMessage(errorMessages.unableToGetNotifcations);
		}
	},

	getByUserIdAndFriendRequestId: async (user, userId, friendRequestId) => {
		if (!canManageUser(user, userId)) {
			throw new ErrorMessage(errorMessages.unauthorizedToGetNotification);
		}

		try {
			const notification = await db.notification.getByUserIdAndFriendRequestId(userId, friendRequestId);
			const filteredNotification = await createFilteredNotification(notification);
			return filteredNotification;
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

const createFilteredNotification = async (notification) => {
	if (notification.type === fulfillmentType()) {
		const reservationId = notification.reservation;
		const item = await db.reservation.getItem(reservationId);
		notification.item = item;
	}

	// Remove reservation since we don't want to reveal it to the user
	const { reservation, ...rest } = notification;

	return rest;
};

export default notificationService;
