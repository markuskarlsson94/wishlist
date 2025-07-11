import { afterAll, beforeAll, expect, describe, it } from "vitest";
import db from "../db";
import wishlistService from "./wishlistService";
import { initUserRoles, adminRole, userRole } from "../roles";
import errorMessages from "../errors/errorMessages";
import { initWishlistTypes, publicType, hiddenType, friendType } from "../wishlistTypes";
import userService, { usersAreFriends } from "./userService";

let adminId;
let user1Id;
let user2Id;
let user3Id;

let admin;
let user1;
let user2;
let user3;

let wishlistAdminId;
let wishlist2AdminId;
let wishlistUser1Id1;
let wishlistUser1Id2;

let item1user1Id;
let item2user1Id;
let item3user1Id;
let item4user1Id;

let item1AdminId;
let item2AdminId;
let item3AdminId;
let item4AdminId;

let reservation1User1Id;
let reservation2User1Id;
let reservation1User2Id;

const wishlsitTitleAdmin = "adminWishlist";
const wishlistTitleUser = "userWishlist";
const wishlistDescription = "test description";

const itemTitle = "Item title";
const itemDescription = "Item description";
const itemLink = "localhost";

beforeAll(async () => {
	await db.connect();
	await db.init();
	await initUserRoles();
	await initWishlistTypes();

	adminId = await db.user.add("wishlistServiceTestAdmin@mail.com", "Admin", "Adminsson", "abc", adminRole());
	user1Id = await db.user.add("wishlistServiceTestUser1@mail.com", "User1", "Usersson", "abc", userRole());
	user2Id = await db.user.add("wishlistServiceTestUser2@mail.com", "User2", "Usersson", "abc", userRole());
	user3Id = await db.user.add("wishlistServiceTestUser3@mail.com", "User3", "Usersson", "abc", userRole());

	admin = { id: adminId, role: adminRole() };
	user1 = { id: user1Id, role: userRole() };
	user2 = { id: user2Id, role: userRole() };
	user3 = { id: user3Id, role: userRole() };
});

afterAll(async () => {
	await db.disconnect();
});

describe("sanity check", async () => {
	it("users should be created", async () => {
		expect(adminId).toBeGreaterThan(0);
		expect(user1Id).toBeGreaterThan(0);
		expect(user2Id).toBeGreaterThan(0);
	});

	it("DB should be empty", async () => {
		const res = await wishlistService.getAll();
		expect(res.length).toBe(0);
	});
});

describe("adding wishlist", () => {
	it("It should add wishlist with correct info", async () => {
		wishlistAdminId = await wishlistService.add(admin, adminId, wishlsitTitleAdmin, wishlistDescription);

		wishlistUser1Id1 = await wishlistService.add(user1, user1Id, wishlistTitleUser, wishlistDescription);

		wishlistUser1Id2 = await wishlistService.add(user1, user1Id, wishlistTitleUser, wishlistDescription);

		expect(wishlistAdminId).toBeGreaterThan(0);
		expect(wishlistUser1Id1).toBeGreaterThan(0);
		expect(wishlistUser1Id2).toBeGreaterThan(0);

		const wishlistAdmin = await wishlistService.getById(admin, wishlistAdminId);

		expect(wishlistAdmin.id).toBe(wishlistAdminId);
		expect(wishlistAdmin.title).toBe(wishlsitTitleAdmin);
		expect(wishlistAdmin.description).toBe(wishlistDescription);
		expect(wishlistAdmin.type).toBe(publicType());

		const wishlistUser1 = await wishlistService.getById(user1, wishlistUser1Id1);

		expect(wishlistUser1.id).toBe(wishlistUser1Id1);
		expect(wishlistUser1.title).toBe(wishlistTitleUser);
		expect(wishlistUser1.description).toBe(wishlistDescription);
		expect(wishlistUser1.type).toBe(publicType());

		const wishlistUser2 = await wishlistService.getById(user1, wishlistUser1Id2);

		expect(wishlistUser2.id).toBe(wishlistUser1Id2);
		expect(wishlistUser2.title).toBe(wishlistTitleUser);
		expect(wishlistUser2.description).toBe(wishlistDescription);
		expect(wishlistUser2.type).toBe(publicType());
	});

	it("should not allow adding wishlist to other user", async () => {
		await expect(
			(async () => {
				await wishlistService.add(user2, user1Id, "title", "description");
			})(),
		).rejects.toThrowError(errorMessages.unauthorizedToAddWishlist.message);
	});
});

describe("updating wishlists", () => {
	it("should allow updating own wishlist", async () => {
		let wishlist = await wishlistService.getById(user1, wishlistUser1Id1);
		expect(wishlist.title).toBe(wishlistTitleUser);
		expect(wishlist.description).toBe(wishlistDescription);

		await wishlistService.update(user1, wishlistUser1Id1, {
			title: "New title",
			description: "New description",
		});

		wishlist = await wishlistService.getById(user1, wishlistUser1Id1);
		expect(wishlist.title).toBe("New title");
		expect(wishlist.description).toBe("New description");
	});

	it("should allow admin to update other users wishlist", async () => {
		let wishlist = await wishlistService.getById(admin, wishlistUser1Id1);
		expect(wishlist.title).toBe("New title");
		expect(wishlist.description).toBe("New description");

		await wishlistService.update(user1, wishlistUser1Id1, {
			title: "New title 2",
			description: "New description 2",
		});

		wishlist = await wishlistService.getById(user1, wishlistUser1Id1);
		expect(wishlist.title).toBe("New title 2");
		expect(wishlist.description).toBe("New description 2");
	});

	it("should not allow user to update other users wishlist", async () => {
		await expect(
			(async () => {
				await wishlistService.update(user2, wishlistUser1Id1, {
					title: "test",
					description: "test",
				});
			})(),
		).rejects.toThrowError(errorMessages.unauthorizedToUpdateWishlist.message);
	});

	it("should not allow updating unallowed properties", async () => {
		const { id, owner, createdAt, updatedAt } = await wishlistService.getById(admin, wishlistUser1Id1);

		await wishlistService.update(admin, wishlistUser1Id1, {
			id: -1,
			owner: -1,
			createdAt: "",
			updatedAt: "",
		});

		const wishlist = await wishlistService.getById(admin, wishlistUser1Id1);

		expect(wishlist.id).toBe(id);
		expect(wishlist.owner).toBe(owner);
		expect(wishlist.createdAt).toBe(createdAt);
		expect(wishlist.updatedAt).toBe(updatedAt);
	});
});

describe("adding wishlist items", () => {
	it("should add items with correct info", async () => {
		item1user1Id = await wishlistService.item.add({
			user: user1,
			wishlist: wishlistUser1Id1,
			title: itemTitle,
			description: itemDescription,
			link: itemLink,
		});

		expect(item1user1Id).toBeGreaterThan(0);

		const item = await wishlistService.item.getById(user1, item1user1Id);
		expect(item.id).toBe(item1user1Id);
	});

	it("should allow adding item without link", async () => {
		const id = await wishlistService.item.add({
			user: user1,
			wishlist: wishlistUser1Id1,
			title: itemTitle,
			description: itemDescription,
		});

		const item = await wishlistService.item.getById(user1, id);

		expect(item.id).toBe(id);
		expect(item.link).toBe(null);
	});

	it("should not allow adding items to other users wishlists", async () => {
		await expect(
			(async () => {
				await wishlistService.item.add({
					user: user2,
					wishlist: wishlistUser1Id1,
					title: "title",
					description: "description",
				});
			})(),
		).rejects.toThrowError(errorMessages.unauthorizedToUpdateWishlist.message);
	});

	it("should allow admins to add items to other users wishlists", async () => {
		const item2user1Id = await wishlistService.item.add({
			user: admin,
			wishlist: wishlistUser1Id1,
			title: "user1Item1",
			description: "test",
		});

		expect(item2user1Id).toBeGreaterThan(0);
	});

	it("should not allow adding less than one item", async () => {
		await expect(
			(async () => {
				await wishlistService.item.add({
					user: user1,
					wishlist: wishlistUser1Id1,
					title: "title",
					description: "description",
					link: itemLink,
					amount: 0,
				});
			})(),
		).rejects.toThrowError(errorMessages.unableToAddLessThanOneItem.message);
	});

	it("should not allow adding item without title", async () => {
		await expect(
			(async () => {
				await wishlistService.item.add({
					user: user1,
					wishlist: wishlistUser1Id1,
					description: "description",
				});
			})(),
		).rejects.toThrowError(errorMessages.missingItemProperties.message);
	});
});

describe("updating wishlist items", () => {
	it("should allow updating own item", async () => {
		let item = await wishlistService.item.getById(user1, item1user1Id);

		expect(item.title).toBe(itemTitle);
		expect(item.description).toBe(itemDescription);
		expect(item.link).toBe(itemLink);

		await wishlistService.item.update(user1, item1user1Id, {
			title: "New title",
			description: "New description",
			link: "New link",
		});

		item = await wishlistService.item.getById(user1, item1user1Id);

		expect(item.title).toBe("New title");
		expect(item.description).toBe("New description");
		expect(item.link).toBe("New link");
	});

	it("should allow admin to update other users item", async () => {
		let item = await wishlistService.item.getById(admin, item1user1Id);

		expect(item.title).toBe("New title");
		expect(item.description).toBe("New description");

		await wishlistService.item.update(user1, item1user1Id, {
			title: "New title 2",
			description: "New description 2",
		});

		item = await wishlistService.item.getById(admin, item1user1Id);

		expect(item.title).toBe("New title 2");
		expect(item.description).toBe("New description 2");
	});

	it("should not allow user to update other users item", async () => {
		await expect(
			(async () => {
				await wishlistService.item.update(user2, item1user1Id, {
					title: "test",
					description: "test",
				});
			})(),
		).rejects.toThrowError(errorMessages.unauthorizedToUpdateWishlistItem.message);
	});

	it("should not allow updating unallowed properties", async () => {
		const { id, wishlist, amount, createdAt, updatedAt } = await wishlistService.item.getById(user1, item1user1Id);

		await wishlistService.item.update(user1, item1user1Id, {
			id: -1,
			wishlist: -1,
			amount: -1,
			createdAt: "",
			updatedAt: "",
		});

		const item = await wishlistService.item.getById(user1, item1user1Id);

		expect(item.id).toBe(id);
		expect(item.wishlist).toBe(wishlist);
		expect(item.amount).toBe(amount);
		expect(item.createdAt).toEqual(createdAt);
		expect(item.updatedAt).toEqual(updatedAt);
	});
});

describe("finding wishlists", () => {
	it("should find all wishlists", async () => {
		const wishlists = await wishlistService.getAll();
		expect(wishlists.length).toBe(3);
	});

	it("should find by userId", async () => {
		const wishlists = await wishlistService.getByUserId(user1, user1Id);
		expect(wishlists.length).toBe(2);

		const wishlist = wishlists[0];
		expect(wishlist.id).toBe(wishlistUser1Id1);
	});

	it("should not find hidden wishlists unless admin or owner", async () => {
		// Hide one of the two wishlists of user1
		await wishlistService.update(user1, wishlistUser1Id2, {
			type: hiddenType(),
		});

		let wishlists = await wishlistService.getByUserId(user2, user1Id);
		expect(wishlists.length).toBe(1);

		wishlists = await wishlistService.getByUserId(user1, user1Id);
		expect(wishlists.length).toBe(2);

		wishlists = await wishlistService.getByUserId(admin, user1Id);
		expect(wishlists.length).toBe(2);
	});

	it("should generate same error when finding hidden as well as nonexisting wishlist", async () => {
		const expectedErrorMessage = errorMessages.wishlistNotFound.message;

		await expect(
			(async () => {
				await wishlistService.getById(user2, wishlistUser1Id2);
			})(),
		).rejects.toThrowError(expectedErrorMessage);

		await expect(
			(async () => {
				await wishlistService.getById(user2, -1);
			})(),
		).rejects.toThrowError(expectedErrorMessage);
	});

	it("should not find friends-only wishlists unless user is owner, friend, or admin", async () => {
		const wishlistId = await wishlistService.add(user1, user1Id, "friendTest", "test", friendType());

		expect(await usersAreFriends(user1Id, user2Id)).toBeFalsy();

		await expect(
			(async () => {
				await wishlistService.getById(user2, wishlistId);
			})(),
		).rejects.toThrowError(errorMessages.wishlistNotFound.message);

		let wishlist = await wishlistService.getById(user1, wishlistId);
		expect(wishlist.id).toBe(wishlistId);

		wishlist = await wishlistService.getById(admin, wishlistId);
		expect(wishlist.id).toBe(wishlistId);

		await userService.friend.add(user1, user1Id, user2Id);

		wishlist = await wishlistService.getById(user2, wishlistId);
		expect(wishlist.id).toBe(wishlistId);

		await wishlistService.remove(user1, wishlistId);
	});
});

describe("finding wishlist items", async () => {
	// Note: wishlistUser1Id2 is hidden

	it("should find items in wishlist", async () => {
		item2user1Id = await wishlistService.item.add({
			user: user1,
			wishlist: wishlistUser1Id2,
			title: "user1Item1",
			description: "test",
		});

		const items = await wishlistService.getItems(user1, wishlistUser1Id2);
		expect(items.length).toBe(1);
	});

	it("should not find items of hidden wishlist unless admin or owner through getItems", async () => {
		await expect(
			(async () => {
				await wishlistService.getItems(user2, wishlistUser1Id2);
			})(),
		).rejects.toThrowError(errorMessages.wishlistNotFound.message);

		const items = await wishlistService.getItems(admin, wishlistUser1Id2);
		expect(items.length).toBe(1);
	});

	it("should not find items of hidden wishlist unless admin or owner through item.getBy* functions", async () => {
		await expect(
			(async () => {
				await wishlistService.item.getById(user2, item2user1Id);
			})(),
		).rejects.toThrowError(errorMessages.wishlistItemNotFound.message);

		const item = await wishlistService.item.getById(admin, item2user1Id);
		expect(item.id).toBe(item2user1Id);

		await expect(
			(async () => {
				await wishlistService.getItems(user2, wishlistUser1Id2);
			})(),
		).rejects.toThrowError(errorMessages.wishlistNotFound.message);

		const items = await wishlistService.getItems(admin, wishlistUser1Id2);
		expect(items.length).toBe(1);
	});

	it("should generate same error when finding hidden as well as nonexisting wishlist item", async () => {
		const expectedErrorMessage = errorMessages.wishlistItemNotFound.message;

		await expect(
			(async () => {
				await wishlistService.item.getById(user2, item2user1Id);
			})(),
		).rejects.toThrowError(expectedErrorMessage);

		await expect(
			(async () => {
				await wishlistService.item.getById(user2, -1);
			})(),
		).rejects.toThrowError(expectedErrorMessage);
	});

	it("should find owner of item", async () => {
		const owner = await wishlistService.item.getOwner(user2, item1user1Id);
		expect(owner).toBe(user1Id);
	});

	it("should not find owner of item if hidden for other user", async () => {
		await expect(
			(async () => {
				await wishlistService.item.getOwner(user2, item2user1Id);
			})(),
		).rejects.toThrowError(errorMessages.wishlistItemNotFound.message);
	});

	it("should not find owner of nonexisiting item", async () => {
		await expect(
			(async () => {
				await wishlistService.item.getOwner(user1, -1);
			})(),
		).rejects.toThrowError(errorMessages.wishlistItemNotFound.message);
	});

	it("should find owner of item if hidden if admin or owner", async () => {
		let owner = await wishlistService.item.getOwner(user1, item2user1Id);
		expect(owner).toBe(user1Id);

		owner = await wishlistService.item.getOwner(admin, item2user1Id);
		expect(owner).toBe(user1Id);
	});

	//TODO: find reserved item owner?
});

describe("reservations", () => {
	beforeAll(async () => {
		item1AdminId = await wishlistService.item.add({
			user: admin,
			wishlist: wishlistAdminId,
			title: "item1AdminId",
			description: "test",
			link: itemLink,
			amount: 1,
		});

		item2AdminId = await wishlistService.item.add({
			user: admin,
			wishlist: wishlistAdminId,
			title: "item2AdminId",
			description: "test",
			link: itemLink,
			amount: 2,
		});

		item3AdminId = await wishlistService.item.add({
			user: admin,
			wishlist: wishlistAdminId,
			title: "item3AdminId",
			description: "test",
			link: itemLink,
			amount: 3,
		});

		item4AdminId = await wishlistService.item.add({
			user: admin,
			wishlist: wishlistAdminId,
			title: "item4AdminId",
			description: "test",
			link: itemLink,
		});
	});

	it("should init items correctly", async () => {
		const items = await wishlistService.getItems(admin, wishlistAdminId);
		expect(items.length).toBe(4);

		const item1 = await wishlistService.item.getById(admin, item1AdminId);
		expect(item1.amount).toBe(1);

		const item2 = await wishlistService.item.getById(admin, item2AdminId);
		expect(item2.amount).toBe(2);

		const item3 = await wishlistService.item.getById(admin, item3AdminId);
		expect(item3.amount).toBe(3);

		const item4 = await wishlistService.item.getById(admin, item4AdminId);
		expect(item4.amount).toBe(1);
	});

	describe("creating nonvalid reservations", () => {
		it("should not allow reserving nonexistent item", async () => {
			await expect(
				(async () => {
					await wishlistService.item.reserve(user1, 0);
				})(),
			).rejects.toThrowError(errorMessages.wishlistItemNotFound.message);
		});

		it("should not allow user to reserve own item", async () => {
			await expect(
				(async () => {
					await wishlistService.item.reserve(admin, item1AdminId);
				})(),
			).rejects.toThrowError(errorMessages.unableToReserveOwnItem.message);
		});

		it("should not allow user to reserve hidden item", async () => {
			await wishlistService.update(admin, wishlistAdminId, {
				type: hiddenType(),
			});

			await expect(
				(async () => {
					await wishlistService.item.reserve(user1, item1AdminId);
				})(),
			).rejects.toThrowError(errorMessages.wishlistItemNotFound.message);

			await wishlistService.update(admin, wishlistAdminId, {
				type: publicType(),
			});
		});

		it("should generate same error for trying to reserve hidden as well as nonexisting item", async () => {
			const expectedErrorMessage = errorMessages.reservationNotFound.message;

			await expect(
				(async () => {
					await wishlistService.reservation.getById(user1, 0);
				})(),
			).rejects.toThrowError(expectedErrorMessage);

			await wishlistService.update(admin, wishlistAdminId, {
				type: hiddenType(),
			});

			await expect(
				(async () => {
					await wishlistService.reservation.getById(user1, item1AdminId);
				})(),
			).rejects.toThrowError(expectedErrorMessage);

			await wishlistService.update(admin, wishlistAdminId, {
				type: publicType(),
			});
		});

		it("should not allow user to reserve same item more than once", async () => {
			await wishlistService.item.reserve(user1, item2AdminId);

			await expect(
				(async () => {
					await wishlistService.item.reserve(user1, item2AdminId);
				})(),
			).rejects.toThrowError(errorMessages.itemAlreadyReservedByUser.message);
		});

		it("should not allow user to reserve less than one item", async () => {
			await expect(
				(async () => {
					await wishlistService.item.reserve(user1, item1AdminId, 0);
				})(),
			).rejects.toThrowError(errorMessages.amountToReserveTooSmall.message);
		});

		it("should not allow user to reserve more than available amount", async () => {
			await expect(
				(async () => {
					await wishlistService.item.reserve(user1, item1AdminId, 2);
				})(),
			).rejects.toThrowError(errorMessages.amountToReserveTooLarge.message);
		});
	});

	describe("clearing reservations", () => {
		it("should not allow user to clear other users reservations", async () => {
			await expect(
				(async () => {
					await wishlistService.reservation.clearByUserId(user2, user1Id);
				})(),
			).rejects.toThrowError(errorMessages.unauthorizedToClearReservations.message);
		});

		it("should allow to clear reservations by user id", async () => {
			let reservations = await wishlistService.reservation.getByUserId(user1, user1Id);
			expect(reservations.length).toBeGreaterThan(0);

			await wishlistService.reservation.clearByUserId(user1, user1Id);

			reservations = await wishlistService.reservation.getByUserId(user1, user1Id);
			expect(reservations.length).toBe(0);
		});
	});

	describe("creating valid reservations", () => {
		it("should reserve item correctly", async () => {
			reservation1User1Id = await wishlistService.item.reserve(user1, item1AdminId);
			expect(reservation1User1Id).toBeGreaterThan(0);

			let reservation = await wishlistService.reservation.getById(user1, reservation1User1Id);
			expect(reservation.id).toBe(reservation1User1Id);
			expect(reservation.user).toBe(user1Id);
			expect(reservation.item).toBe(item1AdminId);
			expect(reservation.amount).toBe(1);

			const reservations = await wishlistService.reservation.getByUserId(user1, user1Id);
			expect(reservations.length).toBe(1);

			reservation = reservations[0];
			expect(reservation.id).toBe(reservation1User1Id);
			expect(reservation.user).toBe(user1.id);
			expect(reservation.item).toBe(item1AdminId);
			expect(reservation.amount).toBe(1);
		});

		it("should allow multiple users to reserve item correctly", async () => {
			reservation2User1Id = await wishlistService.item.reserve(user1, item3AdminId);

			let reservation = await wishlistService.reservation.getById(user1, reservation2User1Id);
			expect(reservation.id).toBe(reservation2User1Id);
			expect(reservation.user).toBe(user1Id);
			expect(reservation.item).toBe(item3AdminId);
			expect(reservation.amount).toBe(1);

			reservation1User2Id = await wishlistService.item.reserve(user2, item3AdminId, 2);

			reservation = await wishlistService.reservation.getById(user2, reservation1User2Id);
			expect(reservation.id).toBe(reservation1User2Id);
			expect(reservation.user).toBe(user2Id);
			expect(reservation.item).toBe(item3AdminId);
			expect(reservation.amount).toBe(2);
		});

		it("should not allow user to reserve fully reserved item", async () => {
			await expect(
				(async () => {
					await wishlistService.item.reserve(user2, item1AdminId, 1);
				})(),
			).rejects.toThrowError(errorMessages.amountToReserveTooLarge.message);
		});
	});

	describe("item amount after reservations", () => {
		it("should not change the amount for item owner after reservation", async () => {
			item3user1Id = await wishlistService.item.add({
				user: user1,
				wishlist: wishlistUser1Id1,
				title: "item3user1Id",
				description: "test",
				link: itemLink,
				amount: 2,
			});

			let item = await wishlistService.item.getById(user1, item3user1Id);
			expect(item.amount).toBe(2);

			await wishlistService.item.reserve(user2, item3user1Id, 1);

			item = await wishlistService.item.getById(user1, item3user1Id);
			expect(item.amount).toBe(2);
		});

		it("should change the amount for other user and admin after reservation", async () => {
			let item = await wishlistService.item.getById(user2, item3user1Id);
			expect(item.amount).toBe(1);

			item = await wishlistService.item.getById(admin, item3user1Id);
			expect(item.amount).toBe(1);
		});

		it("should display original amount for admin", async () => {
			const item = await wishlistService.item.getById(admin, item3user1Id);
			expect(item.originalAmount).toBe(2);
		});

		it("should not display original amount for users and reservers", async () => {
			let item = await wishlistService.item.getById(user1, item3user1Id);
			expect(item.originalAmount).toBe(undefined);

			item = await wishlistService.item.getById(user2, item3user1Id);
			expect(item.originalAmount).toBe(undefined);
		});

		it("should display item from wishlist even if it has been fully reserved for other user", async () => {
			item4user1Id = await wishlistService.item.add({
				user: user1,
				wishlist: wishlistUser1Id1,
				title: "item4user1Id",
				description: "test",
				link: itemLink,
				amount: 1,
			});

			await wishlistService.item.reserve(user2, item4user1Id);

			const item = await wishlistService.item.getById(user3, item4user1Id);
			expect(item.amount).toBe(0);
		});

		it("should display item for reserver even if its fully reserved", async () => {
			const item = await wishlistService.item.getById(user2, item4user1Id);
			expect(item.amount).toBe(0);
		});

		it("should display item for admin even if its fully reserved", async () => {
			const item = await wishlistService.item.getById(admin, item4user1Id);
			expect(item.amount).toBe(0);
			expect(item.originalAmount).toBe(1);
		});
	});

	describe("getItems", () => {
		let item1Id;
		let item2Id;
		let wishlist;

		beforeAll(async () => {
			wishlist = await wishlistService.add(user3, user3Id, "wishlist1User3", "test");

			item1Id = await wishlistService.item.add({
				user: user3,
				wishlist: wishlist,
				title: "item1",
				description: "test",
				link: itemLink,
			});

			item2Id = await wishlistService.item.add({
				user: user3,
				wishlist,
				title: "item2",
				description: "test",
				link: itemLink,
				amount: 2,
			});
		});

		afterAll(async () => {
			await wishlistService.remove(user3, wishlist);
		});

		it("should get items properly before reservation", async () => {
			let items = await wishlistService.getItems(user2, wishlist);
			expect(items.length).toBe(2);

			const item1 = items.find((item) => item.id === item1Id);
			const item2 = items.find((item) => item.id === item2Id);

			expect(item1.id).toBe(item1Id);
			expect(item2.id).toBe(item2Id);

			expect(item1.amount).toBe(1);
			expect(item1.originalAmount).toBe(undefined);
			expect(item2.amount).toBe(2);
			expect(item2.originalAmount).toBe(undefined);
		});

		it("should not change amount after reservation for other user", async () => {
			await wishlistService.item.reserve(user1, item1Id);
			await wishlistService.item.reserve(user1, item2Id);

			let items = await wishlistService.getItems(user2, wishlist);
			expect(items.length).toBe(2);

			const item1 = items.find((item) => item.id === item1Id);
			const item2 = items.find((item) => item.id === item2Id);

			expect(item1.id).toBe(item1Id);
			expect(item2.id).toBe(item2Id);

			expect(item2.amount).toBe(1);
			expect(item2.originalAmount).toBe(undefined);
		});

		it("should not change amount for owner after reservation", async () => {
			let items = await wishlistService.getItems(user3, wishlist);
			expect(items.length).toBe(2);

			const item1 = items.find((item) => item.id === item1Id);
			const item2 = items.find((item) => item.id === item2Id);

			expect(item1.id).toBe(item1Id);
			expect(item2.id).toBe(item2Id);

			expect(item1.amount).toBe(1);
			expect(item1.originalAmount).toBe(undefined);
			expect(item2.amount).toBe(2);
			expect(item2.originalAmount).toBe(undefined);
		});

		it("should get all items for reserver even if they are fully reserved", async () => {
			let items = await wishlistService.getItems(user1, wishlist);
			expect(items.length).toBe(2);

			const item1 = items.find((item) => item.id === item1Id);
			const item2 = items.find((item) => item.id === item2Id);

			expect(item1.id).toBe(item1Id);
			expect(item2.id).toBe(item2Id);

			expect(item1.amount).toBe(0);
			expect(item1.originalAmount).toBe(undefined);
			expect(item2.amount).toBe(1);
			expect(item2.originalAmount).toBe(undefined);
		});

		it("should get all items for admin even if they are fully reserved and original amount", async () => {
			let items = await wishlistService.getItems(admin, wishlist);
			expect(items.length).toBe(2);

			const item1 = items.find((item) => item.id === item1Id);
			const item2 = items.find((item) => item.id === item2Id);

			expect(item1.id).toBe(item1Id);
			expect(item2.id).toBe(item2Id);

			expect(item1.amount).toBe(0);
			expect(item1.originalAmount).toBe(1);
			expect(item2.amount).toBe(1);
			expect(item2.originalAmount).toBe(2);
		});
	});

	describe("finding reservations", () => {
		it("should not find other users reservations", async () => {
			await expect(
				(async () => {
					await wishlistService.reservation.getById(user2, reservation1User1Id);
				})(),
			).rejects.toThrowError(errorMessages.reservationNotFound.message);

			await expect(
				(async () => {
					await wishlistService.reservation.getByUserId(user2, user1Id);
				})(),
			).rejects.toThrowError(errorMessages.reservationNotFound.message);
		});

		it("should find other users reservations if admin", async () => {
			const reservation = await wishlistService.reservation.getById(admin, reservation1User1Id);
			expect(reservation.id).toBe(reservation1User1Id);

			const reservations = await wishlistService.reservation.getByUserId(admin, user1Id);
			expect(reservations.length).toBe(2);
		});

		it("should only find reservations by item id if not owner", async () => {
			let reservations = await wishlistService.reservation.getByItemId(user1, item1AdminId);
			expect(reservations.length).toBe(1);

			reservations = await wishlistService.reservation.getByItemId(admin, item1user1Id);
			expect(reservations.length).toBe(0);

			await expect(
				(async () => {
					await wishlistService.reservation.getByItemId(user1, item1user1Id);
				})(),
			).rejects.toThrowError(errorMessages.unauthorizedToViewReservations.message);

			await expect(
				(async () => {
					await wishlistService.reservation.getByItemId(admin, item3AdminId);
				})(),
			).rejects.toThrowError(errorMessages.unauthorizedToViewReservations.message);
		});
	});

	describe("removing reservations", () => {
		it("should not allow user to remove other users reservation", async () => {
			await expect(
				(async () => {
					await wishlistService.reservation.remove(user2, reservation2User1Id);
				})(),
			).rejects.toThrowError(errorMessages.reservationNotFound.message);
		});

		it("should allow admin to remove other users reservation", async () => {
			await wishlistService.reservation.remove(admin, reservation2User1Id);
		});

		it("should not allow user to remove nonexisting reservation", async () => {
			await expect(
				(async () => {
					await wishlistService.reservation.remove(user1, 0);
				})(),
			).rejects.toThrowError(errorMessages.reservationNotFound.message);
		});

		it("should remove reservations if wishlist item is removed", async () => {
			const reservationId = await wishlistService.item.reserve(user1, item4AdminId);
			let reservation = await wishlistService.reservation.getById(user1, reservationId);

			expect(reservation.id).toBe(reservationId);

			await wishlistService.item.remove(admin, item4AdminId);

			await expect(
				(async () => {
					reservation = await wishlistService.reservation.getById(user1, reservationId);
				})(),
			).rejects.toThrowError(errorMessages.reservationNotFound.message);
		});

		it("should remove reservation if wishlist is removed", async () => {
			wishlist2AdminId = await wishlistService.add(admin, adminId, "wishlist2Admin", "test");
			const itemId = await wishlistService.item.add({
				user: admin,
				wishlist: wishlist2AdminId,
				title: "item",
				description: "test",
			});

			const reservationId = await wishlistService.item.reserve(user1, itemId);

			let reservation = await wishlistService.reservation.getById(user1, reservationId);
			expect(reservation.id).toBe(reservationId);

			let reservations = await wishlistService.reservation.getByUserId(user1, user1Id);
			reservations = reservations.filter((r) => r.id === reservationId);
			expect(reservations.length).toBe(1);

			await wishlistService.remove(admin, wishlist2AdminId);

			await expect(
				(async () => {
					reservation = await wishlistService.reservation.getById(user1, reservationId);
				})(),
			).rejects.toThrowError(errorMessages.reservationNotFound.message);

			reservations = await wishlistService.reservation.getByUserId(user1, user1Id);
			reservations = reservations.filter((r) => r.id === reservationId);
			expect(reservations.length).toBe(0);
		});
	});

	describe("reservation visibility", () => {
		let wishlist1, wishlist2;
		let item1, item2;
		let reservation1, reservation2;

		beforeAll(async () => {
			await wishlistService.reservation.clearByUserId(user1, user1Id);

			const reservations = await wishlistService.reservation.getByUserId(user1, user1Id);
			expect(reservations).toEqual([]);

			const wishlists = await wishlistService.getByUserId(user2, user2Id);
			expect(wishlists.length).toBe(0);

			wishlist1 = await wishlistService.add(user2, user2Id, "w1", "", publicType());
			wishlist2 = await wishlistService.add(user2, user2Id, "w2", "", publicType());

			item1 = await wishlistService.item.add({
				user: user2,
				wishlist: wishlist1,
				title: "i1",
				description: "",
			});

			item2 = await wishlistService.item.add({
				user: user2,
				wishlist: wishlist2,
				title: "i2",
				description: "",
			});

			reservation1 = await wishlistService.item.reserve(user1, item1);
			reservation2 = await wishlistService.item.reserve(user1, item2);
		});

		it("should hide reservation if item is hidden for user", async () => {
			let reservations = await wishlistService.reservation.getByUserId(user1, user1Id);

			expect(reservations.length).toBe(2);
			expect(reservations.some((r) => r.item === item1));
			expect(reservations.some((r) => r.item === item2));

			await wishlistService.update(user2, wishlist2, { type: hiddenType() });

			// User 2 hides wishlist 2, which should cause one of user1's reservations to also be hidden
			reservations = await wishlistService.reservation.getByUserId(user1, user1Id);

			expect(reservations.length).toBe(1);
			expect(reservations.some((r) => r.item === item1));
		});
	});
});

describe("removing wishlist items", () => {
	it("should not allow user to remove others wishlist items", async () => {
		await expect(
			(async () => {
				await wishlistService.item.remove(user2, item1user1Id);
			})(),
		).rejects.toThrowError(errorMessages.unauthorizedToUpdateWishlist.message);
	});

	it("should allow removing own wishlist items", async () => {
		await wishlistService.item.remove(user1, item1user1Id);
	});

	it("should allow admin to remove wishlist items", async () => {
		await wishlistService.item.remove(admin, item2user1Id);
	});
});

describe("removing wishlists", () => {
	it("should not allow user to remove others wishlists", async () => {
		await expect(
			(async () => {
				await wishlistService.remove(user1, wishlistAdminId);
			})(),
		).rejects.toThrowError(errorMessages.unauthorizedToDeleteWishlist.message);
	});

	it("should allow removing own wishlists", async () => {
		await wishlistService.remove(user1, wishlistUser1Id1);
	});

	it("should allow admins to remove any wishlist", async () => {
		await wishlistService.remove(admin, wishlistUser1Id2);
	});

	it("should remove wishlists when user is removed", async () => {
		await wishlistService.add(user1, user1Id, "User2Wishlist", "test");
		let wishlists = await wishlistService.getByUserId(user1, user1Id);
		expect(wishlists.length).toBe(1);

		await userService.remove(user1, user1Id);
		wishlists = await wishlistService.getByUserId(user1, user1Id);
		expect(wishlists.length).toBe(0);
	});
});

describe("comments", async () => {
	let wishlistId;
	let itemId;
	let commentId;
	let user4;
	let user4Id;

	beforeAll(async () => {
		user1Id = await db.user.add("wishlistServiceTestUser1@mail.com", "User1", "Usersson", "abc", userRole());
		user1 = { id: user1Id, role: userRole() };

		user4Id = await db.user.add("wishlistServiceTestUser4@mail.com", "User1", "Usersson", "abc", userRole());
		user4 = { id: user4Id, role: userRole() };

		wishlistId = await db.wishlist.add(user1Id, "commentTest", "test", publicType());
		itemId = await db.wishlist.item.add(wishlistId, "testItem", "test", itemLink, 1);
	});

	it("should not allow adding comment for other user", async () => {
		await expect(
			(async () => {
				await wishlistService.item.comment.add(user1, itemId, user2Id, "test comment");
			})(),
		).rejects.toThrowError(errorMessages.unauthorizedToAddComment.message);
	});

	it("should not allow adding comment on hidden item", async () => {
		await wishlistService.update(admin, wishlistId, {
			type: hiddenType(),
		});

		await expect(
			(async () => {
				await wishlistService.item.comment.add(user2, itemId, user2Id, "test comment");
			})(),
		).rejects.toThrowError(errorMessages.wishlistItemNotFound.message);

		await wishlistService.update(admin, wishlistId, {
			type: publicType(),
		});
	});

	it("should add comment successfully", async () => {
		commentId = await wishlistService.item.comment.add(user1, itemId, user1Id, "yeehaw");
		expect(commentId).toBeGreaterThan(0);

		const comment = await wishlistService.item.comment.getById(user1, commentId);
		expect(comment.id).toBe(commentId);
		expect(comment.item).toBe(itemId);
		expect(comment.user).toBe(user1Id);
		expect(comment.comment).toBe("yeehaw");
	});

	it("should not allow removing comment for other user", async () => {
		await expect(
			(async () => {
				await wishlistService.item.comment.remove(user2, commentId);
			})(),
		).rejects.toThrowError(errorMessages.unauthorizedToRemoveComment.message);
	});

	it("should not allow updating comment for other user", async () => {
		await expect(
			(async () => {
				await wishlistService.item.comment.update(user2, commentId, "yeehaw 2");
			})(),
		).rejects.toThrowError(errorMessages.unauthorizedToUpdateComment.message);
	});

	it("should allow user to update own comment", async () => {
		let comment = await wishlistService.item.comment.getById(user1, commentId);
		expect(comment.comment).toBe("yeehaw");
		expect(comment.createdAt).toEqual(comment.updatedAt);

		await wishlistService.item.comment.update(user1, commentId, "yeehaw 2");
		comment = await wishlistService.item.comment.getById(user1, commentId);
		expect(comment.comment).toBe("yeehaw 2");
		expect(comment.createdAt).not.toEqual(comment.updatedAt);
		expect(comment.createdAt < comment.updatedAt).toBeTruthy();
	});

	it("should allow user to remove own comment", async () => {
		await wishlistService.item.comment.remove(user1, commentId);
	});

	it("should allow admin to add comment for user", async () => {
		commentId = await wishlistService.item.comment.add(admin, itemId, user1Id, "yeehaw 3");
		expect(commentId).toBeGreaterThan(0);
	});

	it("should allow admin to update comment for other user", async () => {
		await wishlistService.item.comment.update(admin, commentId, "yeehaw 4");
		const comment = await wishlistService.item.comment.getById(user1, commentId);
		expect(comment.comment).toBe("yeehaw 4");
	});

	it("should allow admin to remove comment for other user", async () => {
		await wishlistService.item.comment.remove(admin, commentId);

		await expect(
			(async () => {
				await wishlistService.item.comment.getById(admin, commentId);
			})(),
		).rejects.toThrowError(errorMessages.commentNotFound.message);
	});

	it("should not allow user to post comment as admin", async () => {
		const commentId = await wishlistService.item.comment.add(
			user1,
			itemId,
			user1Id,
			"trying to post as admin",
			true,
		);

		const comment = await wishlistService.item.comment.getById(user1, commentId);
		expect(comment.asAdmin).toBe(false);

		await db.wishlist.item.comment.remove(commentId);
	});

	it("should allow admins to post both regular and admin comments", async () => {
		let commentId = await wishlistService.item.comment.add(
			admin,
			itemId,
			adminId,
			"trying to post as regular user",
		);

		let comment = await wishlistService.item.comment.getById(admin, commentId);
		expect(comment.asAdmin).toBe(false);

		await db.wishlist.item.comment.remove(commentId);

		commentId = await wishlistService.item.comment.add(admin, itemId, adminId, "trying to post as admin", true);
		comment = await wishlistService.item.comment.getById(admin, commentId);
		expect(comment.asAdmin).toBe(true);

		await db.wishlist.item.comment.remove(commentId);
	});

	describe("anonymous comments", () => {
		beforeAll(async () => {
			await wishlistService.item.comment.add(user1, itemId, user1Id, "test comment 1"); // user1 is wishlist owner
			await wishlistService.item.comment.add(user2, itemId, user2Id, "test comment 2");
			await wishlistService.item.comment.add(user3, itemId, user3Id, "test comment 3");
			await wishlistService.item.comment.add(user2, itemId, user2Id, "test comment 4");
			await wishlistService.item.comment.add(admin, itemId, adminId, "test comment 5");
			await wishlistService.item.comment.add(admin, itemId, adminId, "test comment 6", true);
		});

		it("should anonymize comments successfully for other user", async () => {
			const comments = await wishlistService.item.comment.getByItemId(user4, itemId);
			expect(comments.length).toBe(6);

			expect(comments[0].anonymizedUserId).toBe(undefined);
			expect(comments[1].anonymizedUserId).toBe(1);
			expect(comments[2].anonymizedUserId).toBe(2);
			expect(comments[3].anonymizedUserId).toBe(1);
			expect(comments[4].anonymizedUserId).toBe(3);
			expect(comments[5].anonymizedUserId).toBe(undefined);

			expect(comments[0].comment).toBe("test comment 1");
			expect(comments[1].comment).toBe("test comment 2");
			expect(comments[2].comment).toBe("test comment 3");
			expect(comments[3].comment).toBe("test comment 4");
			expect(comments[4].comment).toBe("test comment 5");
			expect(comments[5].comment).toBe("test comment 6");

			expect(comments.every((c) => c.user === undefined));
			expect(comments.every((c) => c.isOwnComment === undefined));
		});

		it("should anonymize own comment", async () => {
			const comments = await wishlistService.item.comment.getByItemId(user3, itemId);
			expect(comments.length).toBe(6);

			expect(comments[0].anonymizedUserId).toBe(undefined);
			expect(comments[1].anonymizedUserId).toBe(1);
			expect(comments[2].anonymizedUserId).toBe(2);
			expect(comments[3].anonymizedUserId).toBe(1);
			expect(comments[4].anonymizedUserId).toBe(3);
			expect(comments[5].anonymizedUserId).toBe(undefined);

			expect(comments[0].isOwnComment).toBe(false);
			expect(comments[1].isOwnComment).toBe(false);
			expect(comments[2].isOwnComment).toBe(true);
			expect(comments[3].isOwnComment).toBe(false);
			expect(comments[4].isOwnComment).toBe(false);
			expect(comments[5].isOwnComment).toBe(false);

			expect(comments[0].isItemOwner).toBe(true);
			expect(comments[1].isItemOwner).toBe(false);
			expect(comments[2].isItemOwner).toBe(false);
			expect(comments[3].isItemOwner).toBe(false);
			expect(comments[4].isItemOwner).toBe(false);
			expect(comments[5].isItemOwner).toBe(false);

			expect(comments[0].comment).toBe("test comment 1");
			expect(comments[1].comment).toBe("test comment 2");
			expect(comments[2].comment).toBe("test comment 3");
			expect(comments[3].comment).toBe("test comment 4");
			expect(comments[4].comment).toBe("test comment 5");
			expect(comments[5].comment).toBe("test comment 6");

			expect(comments.every((c) => c.user === undefined));
		});

		it("should preserve original user for admin", async () => {
			const comments = await wishlistService.item.comment.getByItemId(admin, itemId);
			expect(comments.length).toBe(6);

			expect(comments[0].user).toBe(user1Id);
			expect(comments[1].user).toBe(user2Id);
			expect(comments[2].user).toBe(user3Id);
			expect(comments[3].user).toBe(user2Id);
			expect(comments[4].user).toBe(adminId);
			expect(comments[5].user).toBe(adminId);

			expect(comments[0].anonymizedUserId).toBe(undefined);
			expect(comments[1].anonymizedUserId).toBe(1);
			expect(comments[2].anonymizedUserId).toBe(2);
			expect(comments[3].anonymizedUserId).toBe(1);
			expect(comments[4].anonymizedUserId).toBe(3);

			expect(comments[0].isOwnComment).toBe(false);
			expect(comments[1].isOwnComment).toBe(false);
			expect(comments[2].isOwnComment).toBe(false);
			expect(comments[3].isOwnComment).toBe(false);
			expect(comments[4].isOwnComment).toBe(true);
			expect(comments[5].isOwnComment).toBe(true);

			expect(comments[0].isItemOwner).toBe(true);
			expect(comments[1].isItemOwner).toBe(false);
			expect(comments[2].isItemOwner).toBe(false);
			expect(comments[3].isItemOwner).toBe(false);
			expect(comments[4].isItemOwner).toBe(false);
			expect(comments[5].isItemOwner).toBe(false);

			expect(comments[0].comment).toBe("test comment 1");
			expect(comments[1].comment).toBe("test comment 2");
			expect(comments[2].comment).toBe("test comment 3");
			expect(comments[3].comment).toBe("test comment 4");
			expect(comments[4].comment).toBe("test comment 5");
			expect(comments[5].comment).toBe("test comment 6");
		});

		it("should mark admin comments", async () => {
			const comments = await wishlistService.item.comment.getByItemId(user1, itemId);

			expect(comments[0].isAdmin).toBe(false);
			expect(comments[1].isAdmin).toBe(false);
			expect(comments[2].isAdmin).toBe(false);
			expect(comments[3].isAdmin).toBe(false);
			expect(comments[4].isAdmin).toBe(false);
			expect(comments[5].isAdmin).toBe(true);
		});
	});
});
