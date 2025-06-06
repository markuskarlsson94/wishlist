import { afterAll, beforeAll, expect, describe, it } from "vitest";
import userService, { usersAreFriends } from "./userService";
import db from "../db";
import errorMessages from "../errors/errorMessages";
import { adminRole, initUserRoles } from "../roles";
import authService from "./authService";

let admin;
let user1;
let user2;
let user3;
let adminId;
let user1Id;
let user2Id;
let user3Id;

const emailAdmin = "userServiceTestAdmin@mail.com";
const email1 = "userServiceTest1@mail.com";
const email2 = "userServiceTest2@mail.com";
const email3 = "userServiceTest3@mail.com";
const firstName = "UserServiceFirstName";
const lastName = "UserServiceLastName";
const profilePicture = "pic";

beforeAll(async () => {
	await db.connect();
	await db.init();
	await initUserRoles();
});

afterAll(async () => {
	await db.disconnect();
});

describe("adding user", () => {
	it("DB should be empty before adding", async () => {
		const res = await userService.getAll();
		expect(res.length).toBe(0);
	});

	it("should add user with correct info", async () => {
		user1Id = await userService.addWithoutVerification({
			email: email1,
			firstName,
			lastName,
			plaintextPassword: "abc",
			profilePicture,
		});
		expect(user1Id).toBeGreaterThan(0);

		user1 = await db.user.getById(user1Id);
		expect(user1.id).toBe(user1Id);
		expect(user1.email).toBe(email1);
		expect(user1.firstName).toBe(firstName);
		expect(user1.lastName).toBe(lastName);
		expect(user1.profilePicture).toBe(profilePicture);
	});

	it("should make exists(email) return true", async () => {
		expect(await userService.exists(email1)).toBeTruthy();
	});

	it("should not allow adding user with existing email", async () => {
		await expect(
			(async () => {
				await userService.addWithoutVerification({
					email: email1,
					firstName: "Foo",
					lastName: "Bar",
					plaintextPassword: "abc",
				});
			})(),
		).rejects.toThrowError(errorMessages.userAlreadyExists.message);
	});

	it("should add user with different email but same name", async () => {
		user2Id = await userService.addWithoutVerification({
			email: email2,
			firstName,
			lastName,
			plaintextPassword: "abc",
		});
		expect(user2Id).toBeGreaterThan(0);

		user2 = await db.user.getById(user2Id);
		expect(user2.id).toBe(user2Id);
	});

	it("should not add user when supplying missing properties", async () => {
		await expect(
			(async () => {
				await userService.addWithoutVerification({ firstName, lastName, plaintextPassword: "abc" });
			})(),
		).rejects.toThrowError(errorMessages.missingUserProperties.message);

		await expect(
			(async () => {
				await userService.addWithoutVerification({ email: email1, lastName, plaintextPassword: "abc" });
			})(),
		).rejects.toThrowError(errorMessages.missingUserProperties.message);

		await expect(
			(async () => {
				await userService.addWithoutVerification({ email: email1, firstName, plaintextPassword: "abc" });
			})(),
		).rejects.toThrowError(errorMessages.missingUserProperties.message);

		await expect(
			(async () => {
				await userService.addWithoutVerification({ email: email1, firstName, lastName });
			})(),
		).rejects.toThrowError(errorMessages.missingUserProperties.message);

		// misspelled "email" as "mail"
		await expect(
			(async () => {
				await userService.addWithoutVerification({
					mail: email1,
					firstName,
					lastName,
					plaintextPassword: "abc",
				});
			})(),
		).rejects.toThrowError(errorMessages.missingUserProperties.message);
	});
});

describe("searching for user", async () => {
	it("should find user by id", async () => {
		const user = await userService.getById(user1, user1Id);
		expect(user.id).toBe(user1Id);
		expect(user.email).toBe(email1);
		expect(user.firstName).toBe(firstName);
		expect(user.lastName).toBe(lastName);
	});

	it("should find user by email", async () => {
		const user = await userService.getByEmail(user1, email1);
		expect(user.id).toBe(user1Id);
		expect(user.email).toBe(email1);
		expect(user.firstName).toBe(firstName);
		expect(user.lastName).toBe(lastName);
	});

	it("should not find nonexisting user", async () => {
		await expect(
			(async () => {
				await userService.getById(user1, -1);
			})(),
		).rejects.toThrowError(errorMessages.userNotFound.message);

		await expect(
			(async () => {
				await userService.getByEmail(user1, "a@mail.com");
			})(),
		).rejects.toThrowError(errorMessages.userNotFound.message);
	});

	describe("searching by name", () => {
		let id1;
		let id2;
		let id3;

		beforeAll(async () => {
			id1 = await userService.addWithoutVerification({
				email: "mail@mail.com",
				firstName: "Nils",
				lastName: "Malandsson",
				plaintextPassword: "abc",
			});
			id2 = await userService.addWithoutVerification({
				email: "mail2@mail.com",
				firstName: "Truls",
				lastName: "Minipizza",
				plaintextPassword: "abc",
			});
			id3 = await userService.addWithoutVerification({
				email: "mail3@mail.com",
				firstName: "Nils-Jörgen",
				lastName: "Json",
				plaintextPassword: "abc",
			});
		});

		it("should find by searching for first name", async () => {
			const data = await userService.getByFullName("Nils");
			expect(data.users.length).toBe(2);
			expect(data.users.includes(id1)).toBeTruthy();
			expect(data.users.includes(id3)).toBeTruthy();
		});

		it("should find by searching for last name", async () => {
			const data = await userService.getByFullName("Mini");
			expect(data.users.length).toBe(1);
			expect(data.users.includes(id2)).toBeTruthy();
		});

		it("should find not be case sensitive", async () => {
			const data = await userService.getByFullName("trULs");
			expect(data.users.length).toBe(1);
			expect(data.users.includes(id2)).toBeTruthy();
		});

		it("should find by searching for part of first and last name", async () => {
			const data = await userService.getByFullName("s m");
			expect(data.users.length).toBe(2);
			expect(data.users.includes(id1)).toBeTruthy();
			expect(data.users.includes(id2)).toBeTruthy();
		});

		it("should not allow too short queries", async () => {
			await expect(
				(async () => {
					await userService.getByFullName("ab");
				})(),
			).rejects.toThrowError(errorMessages.userQueryTooShort.message);
		});

		afterAll(async () => {
			await db.user.remove(id1);
			await db.user.remove(id2);
			await db.user.remove(id3);
		});
	});
});

describe("removing user", async () => {
	it("should not allow user to remove someone else", async () => {
		await expect(
			(async () => {
				await userService.remove(user1, user2Id);
			})(),
		).rejects.toThrowError(errorMessages.unauthorizedToDeleteOtherUser.message);
	});

	it("should not allow user to remove nonexisiting user", async () => {
		await expect(
			(async () => {
				await userService.remove(user1, 0);
			})(),
		).rejects.toThrowError(errorMessages.unauthorizedToDeleteOtherUser.message);
	});

	it("should allow removing same user", async () => {
		const res = await userService.remove(user2, user2Id);
		expect(res).toBe(undefined);
	});

	it("should make exists(email) return false", async () => {
		const res = await userService.exists(email2);
		expect(res).toBeFalsy();
	});
});

describe("friends", () => {
	beforeAll(async () => {
		adminId = await userService.addWithoutVerification({
			email: emailAdmin,
			firstName,
			lastName,
			plaintextPassword: "abc",
			role: adminRole(),
		});
		admin = await db.user.getById(adminId);

		user2Id = await userService.addWithoutVerification({
			email: email2,
			firstName,
			lastName,
			plaintextPassword: "abc",
		});
		user2 = await db.user.getById(user2Id);

		user3Id = await userService.addWithoutVerification({
			email: email3,
			firstName,
			lastName,
			plaintextPassword: "abc",
		});
		user3 = await db.user.getById(user3Id);
	});

	describe("adding friends", () => {
		it("should not allow adding same user as friend", async () => {
			await expect(
				(async () => {
					await userService.friend.add(user1, user1Id, user1Id);
				})(),
			).rejects.toThrowError(errorMessages.unableToAddSameUserAsFriend.message);
		});

		it("should correctly add friend", async () => {
			expect(await userService.friend.with(user1Id, user2Id)).toBeFalsy();
			await userService.friend.add(user1, user1Id, user2Id);
			expect(await userService.friend.with(user1Id, user2Id)).toBeTruthy();
		});

		it("should correctly add friend if order is reversed", async () => {
			expect(await userService.friend.with(user1Id, user3Id)).toBeFalsy();
			await userService.friend.add(user1, user3Id, user1Id);
			expect(await userService.friend.with(user1Id, user3Id)).toBeTruthy();
		});

		it("should not allow adding exisiting friends", async () => {
			await expect(
				(async () => {
					await userService.friend.add(user1, user1Id, user2Id);
				})(),
			).rejects.toThrowError(errorMessages.userAlreadyAddedAsFriend.message);
		});

		it("should not allow adding exisiting friends if order is reversed", async () => {
			await expect(
				(async () => {
					await userService.friend.add(user1, user2Id, user1Id);
				})(),
			).rejects.toThrowError(errorMessages.userAlreadyAddedAsFriend.message);
		});

		it("should not allow adding friend for other user", async () => {
			await expect(
				(async () => {
					await userService.friend.add(user1, user2Id, user3Id);
				})(),
			).rejects.toThrowError(errorMessages.unauthorizedToAddFriend.message);
		});

		it("should allow adding friend for other user if admin", async () => {
			expect(await userService.friend.with(user2Id, user3Id)).toBeFalsy();
			await userService.friend.add(admin, user2Id, user3Id);
			expect(await userService.friend.with(user2Id, user3Id)).toBeTruthy();
		});

		it("should not allow adding non existing user as friend", async () => {
			await expect(
				(async () => {
					await userService.friend.add(user1, user1Id, -1);
				})(),
			).rejects.toThrowError(errorMessages.serverError.message);
		});
	});

	describe("viewing friends", () => {
		it("should allow viewing friends of self", async () => {
			const res = await userService.friend.getByUserId(user1, user1Id);
			expect(res.length).toBe(2);
		});

		it("should allow viewing friends of friends", async () => {
			const res = await userService.friend.getByUserId(user1, user2Id);
			expect(res.length).toBe(2);
		});

		it("should allow to view friends of non friends", async () => {
			const res = await userService.friend.getByUserId(user1, adminId);
			expect(res.length).toBe(0);
		});

		it("should allow admin to view friends of non friends", async () => {
			const res = await userService.friend.getByUserId(admin, user1Id);
			expect(res.length).toBe(2);
		});

		it("should allow to view friends of non existing user", async () => {
			const res = await userService.friend.getByUserId(user1, -1);
			expect(res.length).toBe(0);
		});
	});

	describe("removing friends", () => {
		/*it("should not allow to remove non existing user as friend", async () => {
            await expect((async () => {
                await userService.friend.remove(user1, user1Id, -1);
            })()).rejects.toThrowError(errorMessages.unauthorizedToRemoveFriend.message);
        });*/

		it("should not allow to remove friends of other user", async () => {
			await expect(
				(async () => {
					await userService.friend.remove(user1, user2Id, user3Id);
				})(),
			).rejects.toThrowError(errorMessages.unauthorizedToRemoveFriend.message);
		});

		it("should allow admin to remove friends of other user", async () => {
			expect(await userService.friend.with(user2Id, user3Id)).toBeTruthy();
			await userService.friend.remove(admin, user2Id, user3Id);
			expect(await userService.friend.with(user2Id, user3Id)).toBeFalsy();
		});

		it("should not allow to remove same user as friend", async () => {
			await expect(
				(async () => {
					await userService.friend.remove(user1, user1Id, user1Id);
				})(),
			).rejects.toThrowError(errorMessages.unableToRemoveSameUserAsFriend.message);
		});

		it("should remove friend successfully", async () => {
			expect(await userService.friend.with(user2Id, user1Id)).toBeTruthy();
			await userService.friend.remove(user1, user1Id, user2Id);
			expect(await userService.friend.with(user2Id, user1Id)).toBeFalsy();
		});

		it("should remove friend successfully if order is reversed", async () => {
			await userService.friend.add(user1, user1Id, user2Id);

			expect(await userService.friend.with(user1Id, user2Id)).toBeTruthy();
			await userService.friend.remove(user1, user2Id, user1Id);
			expect(await userService.friend.with(user1Id, user2Id)).toBeFalsy();
		});

		it("should remove friendship if user is removed", async () => {
			await userService.friend.add(admin, user2Id, user3Id);
			expect(await userService.friend.with(user2Id, user3Id)).toBeTruthy();

			await userService.remove(admin, user3Id);
			expect(await userService.friend.with(user2Id, user3Id)).toBeFalsy();
		});

		/*it("should not allow to remove non friend", async () => {
            await expect((async () => {
                await userService.friend.remove(user1, user1Id, user2Id);
            })()).rejects.toThrowError(errorMessages.unableToRemoveSameUserAsFriend.message);
        });*/
	});
});

describe("friend requests", () => {
	let requestId;

	beforeAll(async () => {
		user3Id = await userService.addWithoutVerification({
			email: email3,
			firstName,
			lastName,
			plaintextPassword: "abc",
		});
		user3 = await db.user.getById(user3Id);
	});

	describe("creating requests", () => {
		it("should not allow creating friend request for other user", async () => {
			await expect(
				(async () => {
					await userService.friendRequest.add(user1, user2Id, user1Id);
				})(),
			).rejects.toThrowError(errorMessages.unauthorizedToCreateFriendRequest.message);
		});

		it("should not allow creating friend request for same user", async () => {
			await expect(
				(async () => {
					await userService.friendRequest.add(user1, user1Id, user1Id);
				})(),
			).rejects.toThrowError(errorMessages.unableToCreateFriendRequestWithSelf.message);
		});

		it("should not allow creating friend request for non existing user", async () => {
			await expect(
				(async () => {
					await userService.friendRequest.add(user1, user1Id, -1);
				})(),
			).rejects.toThrowError(errorMessages.unableToCreateFriendRequest.message);
		});

		it("should successfully create friend request", async () => {
			requestId = await userService.friendRequest.add(user1, user1Id, user2Id);
			expect(requestId).toBeGreaterThan(0);
		});

		it("should not create friend request if one already exists for both users", async () => {
			await expect(
				(async () => {
					await userService.friendRequest.add(user1, user1Id, user2Id);
				})(),
			).rejects.toThrowError(errorMessages.unableToCreateFriendRequest.message);
		});

		it("should not create friend request if one already exists for both users and order is reversed", async () => {
			await expect(
				(async () => {
					await userService.friendRequest.add(user2, user2Id, user1Id);
				})(),
			).rejects.toThrowError(errorMessages.unableToCreateFriendRequest.message);
		});

		it("should not allow creating friend request for existing friend", async () => {
			await userService.friend.add(user1, user1Id, user2Id);

			await expect(
				(async () => {
					await userService.friendRequest.add(user1, user1Id, user2Id);
				})(),
			).rejects.toThrowError(errorMessages.userAlreadyAddedAsFriend.message);

			await userService.friend.remove(user1, user1Id, user2Id);
		});

		it("should allow admin to create request for other user", async () => {
			let id = await userService.friendRequest.add(admin, user2Id, user3Id);
			expect(id).toBeGreaterThan(0);
		});
	});

	describe("viewing requests", () => {
		it("should allow viewing own sent requests", async () => {
			let request = await userService.friendRequest.getById(user1, requestId);
			expect(request.id).toBe(requestId);
			expect(request.sender).toBe(user1Id);
			expect(request.receiver).toBe(user2Id);

			let requests = await userService.friendRequest.getBySenderId(user1, user1Id);
			expect(requests.length).toBe(1);

			request = requests[0];
			expect(request.id).toBe(requestId);
			expect(request.sender).toBe(user1Id);
			expect(request.receiver).toBe(user2Id);

			requests = await userService.friendRequest.getBySenderId(user2, user2Id);
			expect(requests.length).toBe(1);

			request = requests[0];
			expect(request.sender).toBe(user2Id);
			expect(request.receiver).toBe(user3Id);
		});

		it("should allow viewing own receiving requests", async () => {
			let request = await userService.friendRequest.getById(user2, requestId);
			expect(request.id).toBe(requestId);
			expect(request.sender).toBe(user1Id);
			expect(request.receiver).toBe(user2Id);

			let requests = await userService.friendRequest.getByReceiverId(user1, user1Id);
			expect(requests.length).toBe(0);

			requests = await userService.friendRequest.getByReceiverId(user2, user2Id);
			expect(requests.length).toBe(1);

			request = requests[0];
			expect(request.sender).toBe(user1Id);
			expect(request.receiver).toBe(user2Id);
		});

		it("should not allow viewing requests for other user", async () => {
			await expect(
				(async () => {
					await userService.friendRequest.getByReceiverId(user1, user2Id);
				})(),
			).rejects.toThrowError(errorMessages.unauthorizedToGetFriendRequests.message);

			await expect(
				(async () => {
					await userService.friendRequest.getBySenderId(user2, user1Id);
				})(),
			).rejects.toThrowError(errorMessages.unauthorizedToGetFriendRequests.message);
		});

		it("should not allow viewing requests for non existing user", async () => {
			await expect(
				(async () => {
					await userService.friendRequest.getByReceiverId(user1, -1);
				})(),
			).rejects.toThrowError(errorMessages.unauthorizedToGetFriendRequests.message);

			await expect(
				(async () => {
					await userService.friendRequest.getBySenderId(user1, -1);
				})(),
			).rejects.toThrowError(errorMessages.unauthorizedToGetFriendRequests.message);
		});

		it("should not allow viewing non existing request", async () => {
			await expect(
				(async () => {
					await userService.friendRequest.getById(user1, -1);
				})(),
			).rejects.toThrowError(errorMessages.unauthorizedToGetFriendRequest.message);
		});

		it("should allow admin to view other users requests", async () => {
			let requests = await userService.friendRequest.getBySenderId(admin, user1Id);
			expect(requests.length).toBe(1);

			requests = await userService.friendRequest.getByReceiverId(admin, user2Id);
			expect(requests.length).toBe(1);
		});
	});

	describe("removing requests", () => {
		it("should not allow removing non existing request", async () => {
			await expect(
				(async () => {
					await userService.friendRequest.remove(user1, -1);
				})(),
			).rejects.toThrowError(errorMessages.unauthorizedToRemoveFriendRequest.message);
		});

		it("should not allow removing request if user is not sender or receiver", async () => {
			await expect(
				(async () => {
					await userService.friendRequest.remove(user3, requestId);
				})(),
			).rejects.toThrowError(errorMessages.unauthorizedToRemoveFriendRequest.message);
		});

		it("should allow sender to remove request", async () => {
			await userService.friendRequest.remove(user1, requestId);
		});

		it("should allow receiver to remove request", async () => {
			requestId = await userService.friendRequest.add(user1, user1Id, user2Id);
			await userService.friendRequest.remove(user2, requestId);
		});

		it("should allow admin to remove to remove request", async () => {
			requestId = await userService.friendRequest.add(user1, user1Id, user2Id);
			await userService.friendRequest.remove(admin, requestId);
		});

		it("should not create friendship when request is removed", async () => {
			requestId = await userService.friendRequest.add(user1, user1Id, user2Id);
			expect(await usersAreFriends(user1Id, user2Id)).toBeFalsy();

			await userService.friendRequest.remove(user1, requestId);
			expect(await usersAreFriends(user1Id, user2Id)).toBeFalsy();
		});

		it("should remove request if sender or receiver is removed", async () => {
			const id = await userService.friendRequest.add(user1, user1Id, user3Id);
			let request = await db.user.friendRequest.getById(id);
			expect(request.id).toBe(id);

			await userService.remove(admin, user3Id);

			await expect(
				(async () => {
					await userService.friendRequest.getById(admin, id);
				})(),
			).rejects.toThrowError(errorMessages.unauthorizedToGetFriendRequest.message);
		});
	});

	describe("accepting requests", async () => {
		beforeAll(async () => {
			user3Id = await userService.addWithoutVerification({
				email: email3,
				firstName,
				lastName,
				plaintextPassword: "abc",
			});
			user3 = await db.user.getById(user3Id);
		});

		it("should not allow accepting non existing request", async () => {
			await expect(
				(async () => {
					await userService.friendRequest.accept(user1, -1);
				})(),
			).rejects.toThrowError(errorMessages.unauthorizedToAcceptFriendRequest.message);
		});

		it("should not allow accepting own sent request", async () => {
			const id = await userService.friendRequest.add(user1, user1Id, user2Id);

			await expect(
				(async () => {
					await userService.friendRequest.accept(user1, id);
				})(),
			).rejects.toThrowError(errorMessages.unauthorizedToAcceptFriendRequest.message);
		});

		it("should not allow accepting other users request", async () => {
			const id = await userService.friendRequest.add(user2, user2Id, user3Id);

			await expect(
				(async () => {
					await userService.friendRequest.accept(user1, id);
				})(),
			).rejects.toThrowError(errorMessages.unauthorizedToAcceptFriendRequest.message);
		});

		it("should allow admin to accept other users request", async () => {
			const request = await db.user.friendRequest.getBySenderAndReceiverId(user2Id, user3Id);
			const { id } = request;
			expect(id).toBeGreaterThan(0);

			await userService.friendRequest.accept(admin, id);
		});

		it("should create friendship after accepting request", async () => {
			expect(await usersAreFriends(user1Id, user2Id)).toBeFalsy();

			const request = await db.user.friendRequest.getBySenderAndReceiverId(user1Id, user2Id);
			const { id } = request;
			expect(id).toBeGreaterThan(0);

			await userService.friendRequest.accept(user2, id);

			expect(await usersAreFriends(user1Id, user2Id)).toBeTruthy();
		});

		it("should remove request after request is accepted", async () => {
			await db.user.friend.remove(user1Id, user2Id);

			let request = await userService.friendRequest.add(user1, user1Id, user2Id);
			await userService.friendRequest.accept(user2, request);

			await expect(
				(async () => {
					await userService.friendRequest.getById(user1, request);
				})(),
			).rejects.toThrowError(errorMessages.unauthorizedToGetFriendRequest.message);
		});
	});
});

describe("password reset", () => {
	let token, tokenPrev;

	it("should be possible to request password reset for non exisiting user", async () => {
		const t = await userService.requestPasswordReset("nonexisting@email.com", false);

		expect(t).toBe(undefined);
	});

	it("should not be possible to reset password if request has not been made", async () => {
		await expect(
			(async () => {
				await userService.resetPassword("token", "newPassword");
			})(),
		).rejects.toThrowError(errorMessages.unableToResetPassword.message);
	});

	it("should be possible to request password reset for existing user", async () => {
		tokenPrev = await userService.requestPasswordReset(email1, false);
	});

	it("shoule be possible to request password reset even if request already exists", async () => {
		token = await userService.requestPasswordReset(email1, false);

		expect(token.length).toBeGreaterThan(0);
	});

	it("should not be possible to reset password with previous token", async () => {
		await expect(
			(async () => {
				await userService.resetPassword(tokenPrev, "newPassword");
			})(),
		).rejects.toThrowError(errorMessages.unableToResetPassword.message);
	});

	it("should be possible to reset password with valid token", async () => {
		const newPassword = "password";

		await expect(
			(async () => {
				await authService.login(email1, newPassword);
			})(),
		).rejects.toThrowError(errorMessages.invalidEmailOrPassword.message);

		await userService.resetPassword(token, newPassword);
		await authService.login(email1, newPassword);
	});

	it("should not be possible to reset password again with same token", async () => {
		await expect(
			(async () => {
				await userService.resetPassword(token, "abc");
			})(),
		).rejects.toThrowError(errorMessages.unableToResetPassword.message);
	});
});

describe("password update", () => {
	const password = "password";
	const newPassword = "newpassword";

	let user1;
	let user2;
	let user1Email = "passwordUpdateTest1@mail.com";
	let user2Email = "passwordUpdateTest2@mail.com";
	let user1Id;
	let user2Id;

	beforeAll(async () => {
		user1Id = await userService.addWithoutVerification({
			email: user1Email,
			firstName,
			lastName,
			plaintextPassword: password,
		});
		user1 = await db.user.getById(user1Id);

		user2Id = await userService.addWithoutVerification({
			email: user2Email,
			firstName,
			lastName,
			plaintextPassword: password,
		});
		user2 = await db.user.getById(user2Id);
	});

	afterAll(async () => {
		await userService.remove(admin, user1Id);
		await userService.remove(admin, user2Id);
	});

	it("should not allow updating non existing users password", async () => {
		await expect(
			(async () => {
				await userService.updatePassword(user1, -1, password, newPassword, newPassword);
			})(),
		).rejects.toThrowError(errorMessages.unauthorizedToUpdatePassword.message);
	});

	it("should not let other user update own password", async () => {
		await expect(
			(async () => {
				await userService.updatePassword(user2, user1Id, password, newPassword, newPassword);
			})(),
		).rejects.toThrowError(errorMessages.unauthorizedToUpdatePassword.message);
	});

	it("should not allow updating password if current password is incorrect", async () => {
		await expect(
			(async () => {
				await userService.updatePassword(user1, user1Id, "incorrectPassword", newPassword, newPassword);
			})(),
		).rejects.toThrowError(errorMessages.oldPasswordIncorrect.message);
	});

	it("should allow user to update own password and invalidate old password", async () => {
		await userService.updatePassword(user1, user1Id, password, newPassword, newPassword);
		await authService.login(user1Email, newPassword);

		await expect(
			(async () => {
				await authService.login(user1Email, password);
			})(),
		).rejects.toThrowError(errorMessages.invalidEmailOrPassword.message);
	});

	it("should allow admin to update other user password", async () => {
		await userService.updatePassword(admin, user2Id, password, newPassword, newPassword);
		await authService.login(user2Email, newPassword);

		await expect(
			(async () => {
				await authService.login(user2Email, password);
			})(),
		).rejects.toThrowError(errorMessages.invalidEmailOrPassword.message);
	});
});
