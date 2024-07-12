import "./loadEnv.js";
import knex from "knex";
import config from "./knexfile.js";
import logger from "./logger.js";
import { generatePassword } from "./utilities/password.js";
import userService from "./services/userService.js";

const environment = process.env.NODE_ENV || 'development';
const userTable = "users";
const userRolesTable = "userRoles";
const wishlistTable = "wishlists";
const wishlistTypeTable = "wishlistTypes";
const wishlistItemTable = "wishlistItems";
const reservationsTable = "reservations";
const friendsTable = "friends";

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
            logger.info('Disconnected from database');
        } catch (error) {
            logger.error('Error disconnecting from database', error);
        }
    },

    init: async () => {
        try {
            await dbClient.schema.dropTableIfExists(friendsTable);
            await dbClient.schema.dropTableIfExists(reservationsTable);
            await dbClient.schema.dropTableIfExists(wishlistItemTable);
            await dbClient.schema.dropTableIfExists(wishlistTable);
            await dbClient.schema.dropTableIfExists(userTable);
            await dbClient.schema.dropTableIfExists(userRolesTable);
            await dbClient.schema.dropTableIfExists(wishlistTypeTable);

            await dbClient.schema.createTable(userRolesTable, (table) => {
                table.increments("id").primary();
                table.string("name").notNullable().unique();
            });

            await dbClient(userRolesTable).insert([
                { name: "admin" }, 
                { name: "user" },
            ]);

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

            await dbClient.schema.createTable(wishlistTable, (table) => {
                table.increments("id").primary();
                table.integer("owner").notNullable();
                table.string("title").notNullable();
                table.string("description");
                table.integer("type");

                table.foreign("owner").references("id").inTable(userTable).onDelete("CASCADE");
                table.foreign("type").references("id").inTable(wishlistTypeTable);
                table.timestamps(true, true, true);
            });

            await dbClient.schema.createTable(wishlistItemTable, (table) => {
                table.increments("id").primary();
                table.integer("wishlist").notNullable();
                table.string("title").notNullable();
                table.string("description").notNullable();
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
            email: "user@mail.com",
            firstName: "User",
            lastName: "Usersson",
            password: "$2b$10$nxeNYaYGG0wtb5gDyok29ekEIOeT6t0UjQTy6hpexL2lv/3EQAADq",
            role: userRole,
        });

        logger.info("Database populated");
    },

    user: {
        add: async (email, firstName, lastName, plaintextPassword, role) => {
            const hashedPassword = await generatePassword(plaintextPassword);

            return (await dbClient(userTable)
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
            await dbClient(userTable)
                .delete()
                .where({ id });
        },

        getById: async (id) => {
            return (await dbClient(userTable)
                .select("*")
                .where({ id })
                .first()
            );
        },

        getByEmail: async (email) => {
            return (await dbClient(userTable)
                .select("*")
                .where({ email })
                .first()
            );
        },

        getAll: async () => {
            return (await dbClient(userTable)
                .select("id", "email", "firstName", "lastName", "role", "createdAt")
            );
        },

        exists: async (email) => {
            const res = await dbClient(userTable)
                .select("id")
                .where({ email });  

            return res.length > 0;
        },

        updatePassword: async (id, plaintextPassword) => {
            const hashedPassword = await generatePassword(plaintextPassword);

            await dbClient(userTable)
                .update({ password: hashedPassword })
                .where({ id });
        },
    },

    userRoles: {
        getAll: async () => {
            return (await dbClient(userRolesTable).select("*"));
        },
    },

    wishlist: {
        add: async (userId, title, description, type) => {
            return (await dbClient(wishlistTable)
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
            await dbClient(wishlistTable)
                .delete()
                .where({ id });
        },

        getItems: async (id) => {
            return (await dbClient(wishlistItemTable)
                .select("*")
                .where({ wishlist: id })
            );
        },

        getById: async (id) => {
            return (await dbClient(wishlistTable)
                .select("id", "owner", "title", "description", "type")
                .where({ id })
                .first()
            );
        },

        getByUserId: async (userId) => {
            return (await dbClient(wishlistTable)
                .select("id", "title", "description", "type")
                .where({ owner: userId })
            );
        },

        getAll: async () => {
            return (await dbClient(wishlistTable)
                .select("*")
            );
        },

        getOwner: async (id) => {
            return (await dbClient(wishlistTable)
                .select("owner")
                .where({ id })
                .first()
            )?.owner;
        },

        getTypes: async () => {
            return (await dbClient(wishlistTypeTable)
                .select("*")
            );
        },

        getType: async (id) => {
            return (await dbClient(wishlistTable)
                .select("type")
                .where({ id })
                .first()
            )?.type;
        },

        setType: async (id, type) => {
            await dbClient(wishlistTable)
                .update({ type })
                .where({ id });
        },

        item: {
            add: async (wishlist, title, description, amount) => {
                return (await dbClient(wishlistItemTable)
                    .insert({
                        wishlist,
                        title,
                        description,
                        amount
                    })
                    .returning("id") 
                )[0].id;
            },

            remove: async (id) => {
                await dbClient(wishlistItemTable)
                    .delete()
                    .where({ id })
            },

            reserve: async (user, id, amount) => {
                return (await dbClient(reservationsTable)
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
                        .innerJoin(`${wishlistTable} as w`, `w.id`, "wishlist")
                        .innerJoin(`${userTable} as u`, "u.id", "w.owner")
                        .where("i.id", "=", id)
                        .first()
                )?.userId;
            },

            getById: async (id) => {
                return (await dbClient(wishlistItemTable)
                    .select("*")
                    .where({ id })
                    .first()
                );
            },

            getByWishlistId: async (id) => {
                return (await dbClient(wishlistItemTable)
                    .select("*")
                    .where({ wishlist: id })
                );
            },

            getWishlist: async (id) => {
                return (await dbClient(wishlistItemTable)
                    .select("wishlist")
                    .where({ id })
                    .first()
                )?.wishlist
            },

            getAll: async () => {
                return (
                    await dbClient(wishlistItemTable)
                        .select("*")
                );
            }
        },
    },

    reservation: {
        getItem: async (id) => {
            return (
                await dbClient(reservationsTable)
                    .select("item")
                    .where({ id })
                    .first()
            )?.item;
        },

        getById: async (id) => {
            return (
                await dbClient(reservationsTable)
                    .select("*")
                    .where({ id })
                    .first()
            );
        },

        getByItemId: async (id) => {
            return (await dbClient(reservationsTable)
                .select("*")
                .where({ item: id })
            );
        },

        getByUserId: async (id) => {
            return (await dbClient(reservationsTable)
                .select("*")
                .where({ user: id })
            );
        },

        getByUserIdAndItemId: async (userId, itemId) => {
            return (await dbClient(reservationsTable)
                .select("*")
                .where({
                    user: userId,
                    item: itemId
                })
                .first()
            );
        },

        getUser: async (id) => {
            return (await dbClient(reservationsTable)
                .select("user")
                .where({ id })
                .first()
            )?.user;
        },

        clearByUserId: async (userId) => {
            await dbClient(reservationsTable)
                .del()
                .where({ user: userId });
        },

        remove: async (id) => {
            await dbClient(reservationsTable)
                .del()
                .where({ id });
        },
    }
};

export default db;