import "./loadEnv.js";
import knex from "knex";
import config from "./knexfile.js";
import logger from "./logger.js";
import { generatePassword } from "./utilities/password.js";
import userService from "./services/userService.js";

const environment = process.env.NODE_ENV || "development";
const tokenTable = "tokens";
const userTable = "users";
const userRolesTable = "userRoles";
const wishlistTable = "wishlists";
const wishlistTypeTable = "wishlistTypes";
const wishlistItemTable = "wishlistItems";
const reservationsTable = "reservations";
const friendsTable = "friends";
const friendRequestsTable = "friendRequests";
const commentsTable = "comments";
const waitlistTable = "waitlist";
const passwordTokenTable = "passwordReset";

let dbClient;

const db = {
	connect: async (env = environment) => {
		try {
			dbClient = knex(config[env]);
			logger.info(`Connected to database. Environment: ${env}.`);
		} catch (error) {
			logger.error("Error connecting to database:", error);
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

	init: async () => {
		try {
			await dbClient.schema.dropTableIfExists(passwordTokenTable);
			await dbClient.schema.dropTableIfExists(commentsTable);
			await dbClient.schema.dropTableIfExists(friendRequestsTable);
			await dbClient.schema.dropTableIfExists(friendsTable);
			await dbClient.schema.dropTableIfExists(reservationsTable);
			await dbClient.schema.dropTableIfExists(wishlistItemTable);
			await dbClient.schema.dropTableIfExists(wishlistTable);
			await dbClient.schema.dropTableIfExists(tokenTable);
			await dbClient.schema.dropTableIfExists(userTable);
			await dbClient.schema.dropTableIfExists(userRolesTable);
			await dbClient.schema.dropTableIfExists(wishlistTypeTable);
			await dbClient.schema.dropTableIfExists(waitlistTable);

			await dbClient.schema.createTable(userRolesTable, (table) => {
				table.increments("id").primary();
				table.string("name").notNullable().unique();
			});

			await dbClient(userRolesTable).insert([{ name: "admin" }, { name: "user" }]);

			await dbClient.schema.createTable(wishlistTypeTable, (table) => {
				table.increments("id").primary();
				table.string("name").notNullable().unique();
			});

			await dbClient(wishlistTypeTable).insert([
				{ name: "public" },
				{ name: "friends" },
				{ name: "invite" },
				{ name: "hidden" },
			]);

			await dbClient.schema.createTable(userTable, (table) => {
				table.increments("id").primary();
				table.string("email").notNullable().unique();
				table.string("firstName").notNullable();
				table.string("lastName").notNullable();
				table.string("password").notNullable();
				table.integer("role").notNullable();

				table.foreign("role").references("id").inTable(userRolesTable);
				table.timestamps(true, true, true);
			});

			await dbClient.schema.createTable(tokenTable, (table) => {
				table.increments("id").primary();
				table.integer("user").notNullable().unique();
				table.string("token").notNullable();

				table.foreign("user").references("id").inTable(userTable).onDelete("CASCADE");
			});

			await dbClient.schema.createTable(wishlistTable, (table) => {
				table.increments("id").primary();
				table.integer("owner").notNullable();
				table.string("title").notNullable();
				table.string("description");
				table.integer("type").notNullable();

				table.foreign("owner").references("id").inTable(userTable).onDelete("CASCADE");
				table.foreign("type").references("id").inTable(wishlistTypeTable);
				table.timestamps(true, true, true);
			});

			await dbClient.schema.createTable(wishlistItemTable, (table) => {
				table.increments("id").primary();
				table.integer("wishlist").notNullable();
				table.string("title").notNullable();
				table.string("description").notNullable();
				table.string("link");
				table.integer("amount").notNullable();

				table.foreign("wishlist").references("id").inTable(wishlistTable).onDelete("CASCADE");
				table.timestamps(true, true, true);
			});

			await dbClient.schema.createTable(reservationsTable, (table) => {
				table.increments("id").primary();
				table.integer("user").notNullable();
				table.integer("item").notNullable();
				table.integer("amount").notNullable();

				table.foreign("user").references("id").inTable(userTable).onDelete("CASCADE");
				table.foreign("item").references("id").inTable(wishlistItemTable).onDelete("CASCADE");
				table.unique(["user", "item"]);
				table.timestamps(true, true, true);
			});

			await dbClient.schema.createTable(friendsTable, (table) => {
				table.increments("id").primary();
				table.integer("user1").notNullable();
				table.integer("user2").notNullable();

				table.foreign("user1").references("id").inTable(userTable).onDelete("CASCADE");
				table.foreign("user2").references("id").inTable(userTable).onDelete("CASCADE");
				table.unique(["user1", "user2"]);
				table.timestamps(true, true, true);
			});

			await dbClient.schema.createTable(friendRequestsTable, (table) => {
				table.increments("id").primary();
				table.integer("sender").notNullable();
				table.integer("receiver").notNullable();

				table.foreign("sender").references("id").inTable(userTable).onDelete("CASCADE");
				table.foreign("receiver").references("id").inTable(userTable).onDelete("CASCADE");
				table.unique(["sender", "receiver"]);
				table.timestamps(true, true, true);
			});

			await dbClient.schema.createTable(commentsTable, (table) => {
				table.increments("id").primary();
				table.integer("item").notNullable();
				table.integer("user").notNullable();
				table.string("comment").notNullable();

				table.foreign("item").references("id").inTable(wishlistItemTable).onDelete("CASCADE");
				table.foreign("user").references("id").inTable(userTable);
				table.timestamps(true, true, true);
			});

			await dbClient.schema.createTable(waitlistTable, (table) => {
				table.increments("id").primary();
				table.string("email").notNullable();
				table.string("firstName").notNullable();
				table.string("lastName").notNullable();
				table.string("password").notNullable();
				table.integer("role").notNullable();
				table.string("token").notNullable();

				table.timestamps(true, true, true);
			});

			await dbClient.schema.createTable(passwordTokenTable, (table) => {
				table.increments("id").primary();
				table.string("user").notNullable();
				table.string("token").notNullable();

				table.foreign("user").references("id").inTable(userTable).onDelete("CASCADE");
				table.timestamps(true, true, true);
			});

			logger.info("Database initiated.");
		} catch (error) {
			logger.error(error.message);
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
		add: async (email, firstName, lastName, plaintextPassword, role, token) => {
			const hashedPassword = await generatePassword(plaintextPassword);

			await dbClient(waitlistTable).insert({
				email,
				firstName,
				lastName,
				password: hashedPassword,
				role,
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
			const { email, firstName, lastName, password, role } = await dbClient(waitlistTable)
				.select("*")
				.where({ id })
				.first();

			await dbClient(userTable).insert({ email, firstName, lastName, password, role });
			await dbClient(waitlistTable).delete().where({ email });
		},
	},

	user: {
		add: async (email, firstName, lastName, plaintextPassword, role) => {
			const hashedPassword = await generatePassword(plaintextPassword);

			return (
				await dbClient(userTable)
					.insert({
						email,
						firstName,
						lastName,
						password: hashedPassword,
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

		getByFullName: async (name, limit = 10, offset = 0) => {
			let users = (
				await dbClient.raw(
					`SELECT id FROM ${userTable} WHERE CONCAT("firstName", ' ', "lastName") ILIKE ? ORDER BY id LIMIT ? OFFSET ?`,
					[`%${name}%`, limit + 1, offset],
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

		updatePassword: async (id, plaintextPassword) => {
			const hashedPassword = await generatePassword(plaintextPassword);

			await dbClient(userTable).update({ password: hashedPassword }).where({ id });
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
				const users1 = (await dbClient(friendsTable).select("user2", "createdAt").where({ user1: id })).map(
					(user) => {
						return {
							userId: user.user2,
							createdAt: user.createdAt,
						};
					},
				);

				const users2 = (await dbClient(friendsTable).select("user1", "createdAt").where({ user2: id })).map(
					(user) => {
						return {
							userId: user.user1,
							createdAt: user.createdAt,
						};
					},
				);

				let users = users1.concat(users2);
				users = users.filter((user, index) => users.indexOf(user) === index); // Remove duplicate
				users = users.filter((user) => user.userId !== id); // Remove requested id
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
				add: async (itemId, userId, comment) => {
					return (
						await dbClient(commentsTable)
							.insert({
								item: itemId,
								user: userId,
								comment,
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
						.select("id", "user", "comment", "createdAt", "updatedAt")
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

		getByUserIdAndItemId: async (userId, itemId) => {
			return await dbClient(reservationsTable)
				.select("*")
				.where({
					user: userId,
					item: itemId,
				})
				.first();
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
};

export default db;
