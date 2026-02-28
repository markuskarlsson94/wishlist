import { afterAll, beforeAll, expect, describe, it } from "vitest";
import db from "../db";
import userService from "./userService";
import errorMessages from "../errors/errorMessages";
import { initUserRoles, adminRole } from "../roles";
import { commentType, friendRequestType, initNotificationTypes } from "../notifications";
import notificationService from "./notificationService";
import { initWishlistTypes, publicType } from "../wishlistTypes";
import wishlistService from "./wishlistService";

let admin;
let user1;
let user2;
let user3;
const email1 = "notificationServiceTest1@mail.com";
const email2 = "notificationServiceTest2@mail.com";
const email3 = "notificationServiceTest3@mail.com";
const firstName = "NotificationFirstName";
const lastName = "NotificationLastName";
const password = "abc";

beforeAll(async () => {
	await db.connect();
	await db.init();
	await initUserRoles();
	await initWishlistTypes();
	await initNotificationTypes();

	await userService.addWithoutVerification({ email: email1, firstName, lastName, plaintextPassword: password });
	await userService.addWithoutVerification({ email: email2, firstName, lastName, plaintextPassword: password });
	await userService.addWithoutVerification({ email: email3, firstName, lastName, plaintextPassword: password });

	admin = { role: adminRole() };
	user1 = await db.user.getByEmail(email1);
	user2 = await db.user.getByEmail(email2);
	user3 = await db.user.getByEmail(email3);
});

afterAll(async () => {
	await db.disconnect();
});

describe("creating notifications", async () => {
	let friendRequestId, wishlistId, itemId;

	beforeAll(async () => {
		const notifications = await db.notification.getAll();
		expect(notifications.length).toBe(0);

		wishlistId = await db.wishlist.add(user1.id, "testWishlist", "description", publicType());
		itemId = await db.wishlist.item.add(wishlistId, "testItem", "description", null, 1);
		friendRequestId = await db.user.friendRequest.add(user1.id, user2.id);
	});

	afterAll(async () => {
		await db.wishlist.remove(wishlistId);
		await db.user.friendRequest.remove(friendRequestId);
	});

	it("should create friend request notification succesfully", async () => {
		const id = await notificationService.sendFriendRequestNotification(user1.id, friendRequestId);
		expect(id).toBeGreaterThan(0);

		const notification = await notificationService.getById(id);
		expect(notification.id).toBe(id);
		expect(notification.type).toBe(friendRequestType());
		expect(notification.user).toBe(user1.id);
		expect(notification.friendRequest).toBe(friendRequestId);
		expect(notification.item).toBe(null);
	});

	it("should create comment notification succesfully", async () => {
		const id = await notificationService.sendCommentNotification(user1.id, itemId);

		expect(id).toBeGreaterThan(0);

		const notification = await notificationService.getById(id);
		expect(notification.id).toBe(id);
		expect(notification.type).toBe(commentType());
		expect(notification.user).toBe(user1.id);
		expect(notification.friendRequest).toBe(null);
		expect(notification.item).toBe(itemId);
	});
});

describe("getting notifications", () => {
	let friendRequestId, wishlistId, itemId;
	let friendRequestNotificationId, commentNotificationId;

	beforeAll(async () => {
		const notifications = await db.notification.getAll();
		expect(notifications.length).toBe(0);

		wishlistId = await db.wishlist.add(user1.id, "testWishlist", "description", publicType());
		itemId = await db.wishlist.item.add(wishlistId, "testItem", "description", null, 1);
		friendRequestId = await db.user.friendRequest.add(user1.id, user2.id);

		friendRequestNotificationId = await notificationService.sendFriendRequestNotification(
			user1.id,
			friendRequestId,
		);
		commentNotificationId = await notificationService.sendCommentNotification(user1.id, itemId);
	});

	afterAll(async () => {
		await db.wishlist.remove(wishlistId);
		await db.user.friendRequest.remove(friendRequestId);
	});

	it("should allow user to find own notifications", async () => {
		const notifications = await notificationService.getByUserId(user1, user1.id);
		expect(notifications.length).toBe(2);
	});

	it("should allow admin to find other users notifications", async () => {
		const notifications = await notificationService.getByUserId(admin, user1.id);
		expect(notifications.length).toBe(2);
	});

	it("should not allow getting other users notification", async () => {
		await expect(
			(async () => {
				await notificationService.getByUserId(user2, user1.id);
			})(),
		).rejects.toThrowError(errorMessages.unauthorizedToGetNotification.message);
	});

	it("should not allow getting non existing notification", async () => {
		await expect(
			(async () => {
				await notificationService.getById(user1, -1);
			})(),
		).rejects.toThrowError(errorMessages.unableToGetNotifcations.message);
	});

	it("should allow finding notification based on user id and friend request id", async () => {
		const notification = await notificationService.getByUserIdAndFriendRequestId(user1, user1.id, friendRequestId);
		expect(notification[0].id).toBe(friendRequestNotificationId);
	});

	it("should allow finding notification based on user id and item id", async () => {
		const notification = await notificationService.getByUserIdAndItemId(user1, user1.id, itemId);
		expect(notification[0].id).toBe(commentNotificationId);
	});
});

describe("removing notifications automatically", () => {
	let friendRequestId, wishlistId, itemId;

	beforeAll(async () => {
		let notifications = await db.notification.getAll();
		expect(notifications.length).toBe(0);

		wishlistId = await db.wishlist.add(user1.id, "testWishlist", "description", publicType());
		itemId = await db.wishlist.item.add(wishlistId, "testItem", "description", null, 1);
		friendRequestId = await db.user.friendRequest.add(user1.id, user2.id);

		await notificationService.sendFriendRequestNotification(user1.id, friendRequestId);
		await notificationService.sendCommentNotification(user1.id, itemId);

		notifications = await db.notification.getByUserId(user1.id);
		expect(notifications.length).toBe(2);
	});

	it("should remove notifications when referenced entry is removed", async () => {
		await db.wishlist.item.remove(itemId);
		await db.user.friendRequest.remove(friendRequestId);

		const notifications = await db.notification.getByUserId(user1.id);
		expect(notifications.length).toBe(0);
	});

	afterAll(async () => {
		await db.wishlist.remove(wishlistId);
	});
});

describe("removing notifications manually", () => {
	let friendRequestId, wishlistId, itemId;
	let friendRequestNotification, commentNotification;

	beforeAll(async () => {
		let notifications = await db.notification.getAll();
		expect(notifications.length).toBe(0);

		wishlistId = await db.wishlist.add(user1.id, "testWishlist", "description", publicType());
		itemId = await db.wishlist.item.add(wishlistId, "testItem", "description", null, 1);
		friendRequestId = await db.user.friendRequest.add(user1.id, user2.id);

		friendRequestNotification = await notificationService.sendFriendRequestNotification(user1.id, friendRequestId);
		commentNotification = await notificationService.sendCommentNotification(user1.id, itemId);
	});

	afterAll(async () => {
		await db.wishlist.remove(wishlistId);
		await db.user.friendRequest.remove(friendRequestId);
	});

	it("should not allow removing other users notification", async () => {
		await expect(
			(async () => {
				await notificationService.remove(user2, friendRequestNotification);
			})(),
		).rejects.toThrowError(errorMessages.unauthorizedToRemoveNotification.message);
	});

	it("should allow user to remove own notifications", async () => {
		await notificationService.remove(user1, friendRequestNotification);
	});

	it("should allow admin to remove other users notification", async () => {
		await notificationService.remove(admin, commentNotification);
	});

	it("should allow removing by user id and item id", async () => {
		await notificationService.sendCommentNotification(user1.id, itemId);
		let notifications = await db.notification.getByUserId(user1.id);
		expect(notifications.length).toBe(1);

		await notificationService.removeByUserIdAndItemId(user1, user1.id, itemId);
		notifications = await db.notification.getByUserId(user1.id);
		expect(notifications.length).toBe(0);
	});
});

describe("removing notifications by user id", () => {
	let wishlistId, itemId;

	beforeAll(async () => {
		let notifications = await db.notification.getAll();
		expect(notifications.length).toBe(0);

		wishlistId = await db.wishlist.add(user1.id, "testWishlist", "description", publicType());
		itemId = await db.wishlist.item.add(wishlistId, "testItem", "description", null, 1);

		await notificationService.sendCommentNotification(user1.id, itemId);
		await notificationService.sendCommentNotification(user2.id, itemId);
	});

	afterAll(async () => {
		await db.wishlist.remove(wishlistId);
	});

	it("should not allow removing oter users notifications", async () => {
		await expect(
			(async () => {
				await notificationService.removeByUserId(user2, user1.id);
			})(),
		).rejects.toThrowError(errorMessages.unauthorizedToRemoveNotification.message);
	});

	it("should not delete other users notifications", async () => {
		let notifications = await notificationService.getByUserId(user1, user1.id);
		expect(notifications.length).toBe(1);

		notifications = await notificationService.getByUserId(user2, user2.id);
		expect(notifications.length).toBe(1);

		await notificationService.removeByUserId(user1, user1.id);

		notifications = await notificationService.getByUserId(user1, user1.id);
		expect(notifications.length).toBe(0);

		notifications = await notificationService.getByUserId(user2, user2.id);
		expect(notifications.length).toBe(1);
	});
});

describe("friend request notifications", () => {
	let friendRequestId;

	beforeAll(async () => {
		let notifications = await db.notification.getAll();
		expect(notifications.length).toBe(0);
	});

	afterAll(async () => {
		await db.user.friendRequest.remove(friendRequestId);
	});

	it("should send a notification to reciever of friend request", async () => {
		friendRequestId = await userService.friendRequest.add(user1, user1.id, user2.id);

		let notifications = await db.notification.getAll();
		expect(notifications.length).toBe(1);

		notifications = await notificationService.getByUserId(user2, user2.id);
		expect(notifications.length).toBe(1);

		const notification = notifications[0];
		expect(notification.friendRequest).toBe(friendRequestId);
		expect(notification.user).toBe(user2.id);
	});

	it("should send a notification to participants of comment section", async () => {});
});

describe("comment notifications", () => {
	let wishlistId, itemId;

	beforeAll(async () => {
		let notifications = await db.notification.getAll();
		expect(notifications.length).toBe(0);

		wishlistId = await db.wishlist.add(user1.id, "testWishlist", "description", publicType());
		itemId = await db.wishlist.item.add(wishlistId, "testItem", "description", null, 1);
	});

	afterAll(async () => {
		await db.wishlist.remove(wishlistId);
	});

	it("should include correct item id", async () => {
		await notificationService.sendCommentNotification(user1.id, itemId);
		const notifications = await notificationService.getByUserId(user1, user1.id);

		expect(notifications.length).toBe(1);

		const notification = notifications[0];
		expect(notification.item).toBe(itemId);

		await db.notification.removeAll();
	});

	it("commenting should send a notification to participants of comment section and item owner", async () => {
		const reservation = await wishlistService.item.reserve(user3, itemId);

		// First comment, send notification to owner and reserver
		await wishlistService.item.comment.add(user2, itemId, user2.id, "What color do you like the most?");

		let notifications = await db.notification.getAll();
		expect(notifications.length).toBe(2);

		notifications = await notificationService.getByUserId(user1, user1.id);
		expect(notifications.length).toBe(1);

		notifications = await notificationService.getByUserId(user3, user3.id);
		expect(notifications.length).toBe(1);
		await db.notification.remove(notifications[0].id);

		await db.notification.removeAll();
		await db.reservation.remove(reservation);

		// Second comment, send notification to user 2
		await wishlistService.item.comment.add(user1, itemId, user1.id, "Hi! I would prever blue :)");

		notifications = await db.notification.getAll();
		expect(notifications.length).toBe(1);

		notifications = await notificationService.getByUserId(user2, user2.id);
		expect(notifications.length).toBe(1);

		await db.notification.removeAll();

		// Third comment, send notification to owner and user 1
		await wishlistService.item.comment.add(user3, itemId, user3.id, "Blue is out of stock");

		notifications = await db.notification.getAll();
		expect(notifications.length).toBe(2);

		notifications = await notificationService.getByUserId(user1, user1.id);
		expect(notifications.length).toBe(1);

		notifications = await notificationService.getByUserId(user2, user2.id);
		expect(notifications.length).toBe(1);

		await db.notification.removeAll();

		// Fourth and fifth comment
		await wishlistService.item.comment.add(user2, itemId, user2.id, "How about this item, is that ok?");
		await wishlistService.item.comment.add(user2, itemId, user2.id, "Or what about this one?");

		notifications = await db.notification.getAll();
		expect(notifications.length).toBe(4);

		notifications = await notificationService.getByUserId(user1, user1.id);
		expect(notifications.length).toBe(2);

		notifications = await notificationService.getByUserId(user3, user3.id);
		expect(notifications.length).toBe(2);
	});
});
