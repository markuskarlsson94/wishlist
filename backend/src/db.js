import logger from "./logger.js";
import { generatePassword } from "./utilities/password.js";
import userService from "./services/userService.js";
import envConfig from "./envConfig.js";

export const tokenTable = "tokens";
export const userTable = "users";
export const userRolesTable = "userRoles";
export const wishlistTable = "wishlists";
export const wishlistTypeTable = "wishlistTypes";
export const wishlistItemTable = "wishlistItems";
export const reservationsTable = "reservations";
export const friendsTable = "friends";
export const friendRequestsTable = "friendRequests";
export const commentsTable = "comments";
export const waitlistTable = "waitlist";
export const passwordTokenTable = "passwordReset";

let dbClient;

const db = {
	connect: async () => {
		try {
			dbClient = envConfig.getDBClient();
		} catch (error) {
			logger.error("Error connecting to database:", error);
		}
	},

	init: async () => {
		try {
			const showMigrationLogs = false;

			if (showMigrationLogs) {
				const [completed, pending] = await dbClient.migrate.list();

				console.log("Completed migrations:", completed);
				console.log("Pending migrations:", pending);
			}

			await dbClient.migrate.rollback(null, true);
			await dbClient.migrate.latest();

			logger.info("Database initiated");
		} catch (error) {
			logger.error("Error initiating database:", error);
		}
	},

	disconnect: async () => {
		try {
			await dbClient.destroy();
			logger.info("Disconnected from database");
		} catch (error) {
			logger.error("Error disconnecting from database", error);
		}
	},

	populate: async () => {
		const userRoles = await userService.getUserRoles();
		const adminRole = userRoles.find((role) => role.name === "admin").id;
		const userRole = userRoles.find((role) => role.name === "user").id;

		await dbClient(userTable).insert({
			email: "admin@mail.com",
			firstName: "Admin",
			lastName: "Adminsson",
			password: "$2b$10$VBOsAZiw9kVAjdixWVSD9.cRMbttIjulDWlWRQJh0j2L6YPJS5G/i",
			role: adminRole,
		});

		await dbClient(userTable).insert({
			email: "user1@mail.com",
			firstName: "User1",
			lastName: "Usersson",
			password: "$2b$10$nxeNYaYGG0wtb5gDyok29ekEIOeT6t0UjQTy6hpexL2lv/3EQAADq",
			role: userRole,
		});

		await dbClient(userTable).insert({
			email: "user2@mail.com",
			firstName: "User2",
			lastName: "Usersson",
			password: "$2b$10$nxeNYaYGG0wtb5gDyok29ekEIOeT6t0UjQTy6hpexL2lv/3EQAADq",
			role: userRole,
		});

		await dbClient(userTable).insert({
			email: "user3@mail.com",
			firstName: "User3",
			lastName: "Usersson",
			password: "$2b$10$nxeNYaYGG0wtb5gDyok29ekEIOeT6t0UjQTy6hpexL2lv/3EQAADq",
			role: userRole,
		});

		logger.info("Database populated");
	},

	token: {
		add: async (user, token) => {
			await dbClient(tokenTable).delete().where({ user });

			await dbClient(tokenTable).insert({
				user,
				token,
			});
		},

		removeByUserId: async (id) => {
			await dbClient(tokenTable).delete().where({ user: id });
		},

		getAll: async () => {
			return await dbClient(tokenTable).select("*");
		},

		getByUserId: async (id) => {
			return (
				await dbClient(tokenTable)
					.select("token")
					.where({
						user: id,
					})
					.first()
			)?.token;
		},
	},

	waitlist: {
		add: async (email, firstName, lastName, plaintextPassword, role, profilePicture, token) => {
			const hashedPassword = await generatePassword(plaintextPassword);

			await dbClient(waitlistTable).insert({
				email,
				firstName,
				lastName,
				password: hashedPassword,
				role,
				profilePicture,
				token,
			});
		},

		getUserByEmail: async (email) => {
			return await dbClient(waitlistTable).select("*").where({ email }).first();
		},

		getUserByToken: async (token) => {
			return await dbClient(waitlistTable).select("*").where({ token }).first();
		},

		admit: async (id) => {
			const { email, firstName, lastName, password, role, profilePicture } = await dbClient(waitlistTable)
				.select("*")
				.where({ id })
				.first();

			await dbClient(userTable).insert({ email, firstName, lastName, password, role, profilePicture });
			await dbClient(waitlistTable).delete().where({ email });
		},
	},

	user: {
		add: async (email, firstName, lastName, plaintextPassword, role, profilePicture, googleId) => {
			const hashedPassword = await generatePassword(plaintextPassword);

			return (
				await dbClient(userTable)
					.insert({
						email,
						firstName,
						lastName,
						password: hashedPassword,
						role,
						profilePicture,
						googleId,
					})
					.returning("id")
			)[0].id;
		},

		addByGoogleId: async (googleId, email, firstName, lastName, profilePicture, role) => {
			return (
				await dbClient(userTable)
					.insert({
						googleId,
						email,
						firstName,
						lastName,
						profilePicture,
						googleProfilePicture: profilePicture,
						role,
					})
					.returning("id")
			)[0].id;
		},

		remove: async (id) => {
			await dbClient(userTable).delete().where({ id });
		},

		getById: async (id) => {
			return await dbClient(userTable).select("*").where({ id }).first();
		},

		getByEmail: async (email) => {
			return await dbClient(userTable).select("*").where({ email }).first();
		},

		getByGoogleId: async (googleId) => {
			return await dbClient(userTable).select("*").where({ googleId }).first();
		},

		getGoogleId: async (id) => {
			return (await dbClient(userTable).select("googleId").where({ id }).first()).googleId;
		},

		getByFullName: async (name, limit = 10, offset = 0) => {
			let users = (
				await dbClient.raw(
					`SELECT id FROM ?? WHERE CONCAT("firstName", ' ', "lastName") ILIKE ? ORDER BY id LIMIT ? OFFSET ?`,
					[userTable, `%${name}%`, limit + 1, offset],
				)
			).rows.map((user) => user.id);

			const hasNextPage = users.length === limit + 1;
			let nextPage = undefined;

			if (hasNextPage) {
				users = users.splice(0, limit);
				nextPage = Math.floor(offset / limit) + 1;
			}

			return {
				users,
				nextPage,
			};
		},

		getAll: async () => {
			return await dbClient(userTable).select("id", "email", "firstName", "lastName", "role", "createdAt");
		},

		exists: async (email) => {
			const res = await dbClient(userTable).select("id").where({ email });

			return res.length > 0;
		},

		update: async (id, data) => {
			await dbClient(userTable)
				.update({ ...data })
				.where({ id });
		},

		updateByGoogleId: async (googleId, firstName, lastName, profilePicture) => {
			await dbClient(userTable)
				.update({ firstName, lastName, googleProfilePicture: profilePicture })
				.where({ googleId });
		},

		updatePassword: async (id, plaintextPassword) => {
			const hashedPassword = await generatePassword(plaintextPassword);

			await dbClient(userTable).update({ password: hashedPassword }).where({ id });
		},

		useGoogleProfilePicture: async (id) => {
			const profilePicture = (await dbClient(userTable).select("googleProfilePicture").where({ id }).first())
				?.googleProfilePicture;

			if (profilePicture) {
				await dbClient(userTable).update({ profilePicture }).where({ id });
			}
		},

		friend: {
			add: async (user1Id, user2Id) => {
				let user1 = user1Id;
				let user2 = user2Id;

				if (user1Id > user2Id) {
					user1 = user2Id;
					user2 = user1Id;
				}

				await dbClient(friendsTable).insert({
					user1,
					user2,
				});
			},

			remove: async (id, userId) => {
				await dbClient(friendsTable)
					.delete()
					.where({
						user1: id,
						user2: userId,
					})
					.orWhere({
						user1: userId,
						user2: id,
					});
			},

			with: async (id, userId) => {
				const res = await dbClient(friendsTable)
					.select("id")
					.where({
						user1: id,
						user2: userId,
					})
					.orWhere({
						user1: userId,
						user2: id,
					})
					.first();

				return res !== undefined;
			},

			getByUserId: async (id) => {
				const users1 = (
					await dbClient(`${friendsTable} as f`)
						.select("f.user2", "f.createdAt", "u.firstName", "u.lastName", "u.profilePicture")
						.innerJoin(`${userTable} as u`, "u.id", "user2")
						.where({ user1: id })
				).map((user) => {
					return {
						userId: user.user2,
						createdAt: user.createdAt,
						firstName: user.firstName,
						lastName: user.lastName,
						profilePicture: user.profilePicture,
					};
				});

				const users2 = (
					await dbClient(`${friendsTable} as f`)
						.select("f.user1", "f.createdAt", "u.firstName", "u.lastName", "u.profilePicture")
						.innerJoin(`${userTable} as u`, "u.id", "user1")
						.where({ user2: id })
				).map((user) => {
					return {
						userId: user.user1,
						createdAt: user.createdAt,
						firstName: user.firstName,
						lastName: user.lastName,
						profilePicture: user.profilePicture,
					};
				});

				let users = users1.concat(users2);
				users = users.filter((user, index) => users.indexOf(user) === index); // Remove duplicate
				users = users.filter((user) => user.userId !== id); // Remove requested id
				users = users.sort((a, b) =>
					`${a.firstName}${a.lastName}`
						.toLowerCase()
						.localeCompare(`${b.firstName}${b.lastName}`.toLowerCase()),
				);

				return users;
			},

			getAll: async () => {
				return await dbClient(friendsTable).select("*");
			},
		},

		friendRequest: {
			add: async (senderId, receiverId) => {
				const res = await db.user.friendRequest.getBySenderAndReceiverId(receiverId, senderId);
				if (res !== undefined) throw new Error("Friend request already exists for users");

				return (
					await dbClient(friendRequestsTable)
						.insert({
							sender: senderId,
							receiver: receiverId,
						})
						.returning("id")
				)[0].id;
			},

			remove: async (id) => {
				await dbClient(friendRequestsTable).delete().where({ id });
			},

			getById: async (id) => {
				return await dbClient(friendRequestsTable).select("*").where({ id }).first();
			},

			getBySenderId: async (id) => {
				return await dbClient(friendRequestsTable).select("*").where({ sender: id });
			},

			getByReceiverId: async (id) => {
				return await dbClient(friendRequestsTable).select("*").where({ receiver: id });
			},

			getBySenderAndReceiverId: async (senderId, receiverId) => {
				return await dbClient(friendRequestsTable)
					.select("*")
					.where({
						sender: senderId,
						receiver: receiverId,
					})
					.first();
			},
		},
	},

	userRoles: {
		getAll: async () => {
			return await dbClient(userRolesTable).select("*");
		},
	},

	wishlist: {
		add: async (userId, title, description, type) => {
			return (
				await dbClient(wishlistTable)
					.insert({
						owner: userId,
						title,
						description,
						type,
					})
					.returning("id")
			)[0].id;
		},

		remove: async (id) => {
			await dbClient(wishlistTable).delete().where({ id });
		},

		getItems: async (id) => {
			return await dbClient(wishlistItemTable).select("*").where({ wishlist: id });
		},

		getById: async (id) => {
			return await dbClient(wishlistTable)
				.select("id", "owner", "title", "description", "type")
				.where({ id })
				.first();
		},

		getByUserId: async (userId) => {
			return await dbClient(wishlistTable)
				.select("id", "title", "description", "type", "createdAt")
				.where({ owner: userId })
				.orderBy("createdAt", "asc");
		},

		getAll: async () => {
			return await dbClient(wishlistTable).select("*");
		},

		getOwner: async (id) => {
			return (await dbClient(wishlistTable).select("owner").where({ id }).first())?.owner;
		},

		getTypes: async () => {
			return await dbClient(wishlistTypeTable).select("*");
		},

		getType: async (id) => {
			return (await dbClient(wishlistTable).select("type").where({ id }).first())?.type;
		},

		update: async (id, data) => {
			await dbClient(wishlistTable)
				.update({ ...data })
				.where({ id });
		},

		item: {
			add: async (wishlist, title, description, link, amount) => {
				return (
					await dbClient(wishlistItemTable)
						.insert({
							wishlist,
							title,
							description,
							link,
							amount,
						})
						.returning("id")
				)[0].id;
			},

			remove: async (id) => {
				await dbClient(wishlistItemTable).delete().where({ id });
			},

			update: async (id, data) => {
				await dbClient(wishlistItemTable)
					.update({ ...data })
					.where({ id });
			},

			reserve: async (user, id, amount) => {
				return (
					await dbClient(reservationsTable)
						.insert({
							user,
							item: id,
							amount,
						})
						.returning("id")
				)[0].id;
			},

			getOwner: async (id) => {
				return (
					await dbClient(`${wishlistItemTable} as i`)
						.select("u.id as userId")
						.innerJoin(`${wishlistTable} as w`, "w.id", "wishlist")
						.innerJoin(`${userTable} as u`, "u.id", "w.owner")
						.where("i.id", "=", id)
						.first()
				)?.userId;
			},

			getById: async (id) => {
				return await dbClient(wishlistItemTable).select("*").where({ id }).first();
			},

			getByWishlistId: async (id) => {
				return await dbClient(wishlistItemTable)
					.select("*")
					.where({ wishlist: id })
					.orderBy("createdAt", "asc");
			},

			getWishlist: async (id) => {
				return (await dbClient(wishlistItemTable).select("wishlist").where({ id }).first())?.wishlist;
			},

			getAll: async () => {
				return await dbClient(wishlistItemTable).select("*");
			},

			comment: {
				add: async (itemId, userId, comment, asAdmin = false) => {
					return (
						await dbClient(commentsTable)
							.insert({
								item: itemId,
								user: userId,
								comment,
								asAdmin,
							})
							.returning("id")
					)[0].id;
				},

				update: async (id, comment) => {
					await dbClient(commentsTable).update({ comment, updatedAt: new Date() }).where({ id });
				},

				remove: async (id) => {
					await dbClient(commentsTable).delete().where({ id });
				},

				removeByUserId: async (userId) => {
					await dbClient(commentsTable).remove().where({ user: userId });
				},

				getById: async (id) => {
					return await dbClient(commentsTable).select("*").where({ id }).first();
				},

				getByItemId: async (itemId) => {
					return await dbClient(commentsTable)
						.select("id", "user", "comment", "asAdmin", "createdAt", "updatedAt")
						.where({ item: itemId })
						.orderBy("createdAt", "asc");
				},

				getItem: async (id) => {
					const item = (await dbClient(commentsTable).select("item").where({ id }).first())?.item;

					return item;
				},

				getAll: async () => {
					return await dbClient(commentsTable).select("*");
				},
			},
		},
	},

	reservation: {
		getItem: async (id) => {
			return (await dbClient(reservationsTable).select("item").where({ id }).first())?.item;
		},

		getById: async (id) => {
			return await dbClient(reservationsTable).select("*").where({ id }).first();
		},

		getByItemId: async (id) => {
			return await dbClient(reservationsTable).select("*").where({ item: id });
		},

		getByUserId: async (id) => {
			return await dbClient(`${reservationsTable} as r`)
				.select("r.*", "i.wishlist", "w.owner")
				.innerJoin(`${wishlistItemTable} as i`, "i.id", "r.item")
				.innerJoin(`${wishlistTable} as w`, "w.id", "i.wishlist")
				.where({ user: id });
		},

		getUser: async (id) => {
			return (await dbClient(reservationsTable).select("user").where({ id }).first())?.user;
		},

		clearByUserId: async (userId) => {
			await dbClient(reservationsTable).del().where({ user: userId });
		},

		remove: async (id) => {
			await dbClient(reservationsTable).del().where({ id });
		},
	},

	passwordToken: {
		add: async (email, token) => {
			const userId = (await db.user.getByEmail(email))?.id;
			if (!userId) return;

			await dbClient(passwordTokenTable).del().where({ user: userId });
			await dbClient(passwordTokenTable).insert({ user: userId, token });
		},

		getByToken: async (token) => {
			return await dbClient(passwordTokenTable).select("*").where({ token }).first();
		},

		remove: async (id) => {
			await dbClient(passwordTokenTable).del().where({ id });
		},
	},
};

export default db;
