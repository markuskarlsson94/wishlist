import { afterAll, beforeAll, expect, describe, it } from "vitest";
import db from "../db";
import wishlistService from "./wishlistService";
import { initUserRoles, adminRole, userRole } from "../roles";
import errorMessages from "../errors/errorMessages";
import { initWishlistTypes, publicType, hiddenType } from "../wishlistTypes";
import userService from "./userService";

let adminId;
let user1Id;
let user2Id;

let admin;
let user1;
let user2;

let wishlistAdminId;
let wishlistUser1Id1;
let wishlistUser1Id2;

let item1user1Id;
let item2user1Id;

beforeAll(async () => {
    await db.connect();
    await db.init();
    await initUserRoles();    
    await initWishlistTypes();

    adminId = await db.user.add("wishlistServiceTestAdmin@mail.com", "Admin", "Adminsson", "abc", adminRole());
    user1Id = await db.user.add("wishlistServiceTestUser1@mail.com", "User", "Usersson", "abc", userRole());
    user2Id = await db.user.add("wishlistServiceTestUser2@mail.com", "User", "Usersson", "abc", userRole());

    admin = { id: adminId, role: adminRole() };
    user1 = { id: user1Id, role: userRole() };
    user2 = { id: user2Id, role: userRole() };
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
        const titleAdmin = "adminWishlist1";
        const titleUser = "userWishlist";
        const description = "test";

        wishlistAdminId = await wishlistService.add(
            admin,
            adminId,
            titleAdmin,
            description,
        );
        
        wishlistUser1Id1 = await wishlistService.add(
            user1,
            user1Id,
            titleUser,
            description,
        );
        
        wishlistUser1Id2 = await wishlistService.add(
            user1,
            user1Id,
            titleUser,
            description,
        );

        expect(wishlistAdminId).toBeGreaterThan(0);
        expect(wishlistUser1Id1).toBeGreaterThan(0);
        expect(wishlistUser1Id2).toBeGreaterThan(0);

        const wishlistAdmin = await wishlistService.getById(admin, wishlistAdminId);

        expect(wishlistAdmin.id).toBe(wishlistAdminId);
        expect(wishlistAdmin.title).toBe(titleAdmin);
        expect(wishlistAdmin.description).toBe(description);
        expect(wishlistAdmin.type).toBe(publicType());
        
        const wishlistUser1 = await wishlistService.getById(user1, wishlistUser1Id1);
        
        expect(wishlistUser1.id).toBe(wishlistUser1Id1);
        expect(wishlistUser1.title).toBe(titleUser);
        expect(wishlistUser1.description).toBe(description);
        expect(wishlistUser1.type).toBe(publicType());
        
        const wishlistUser2 = await wishlistService.getById(user1, wishlistUser1Id2);
        
        expect(wishlistUser2.id).toBe(wishlistUser1Id2);
        expect(wishlistUser2.title).toBe(titleUser);
        expect(wishlistUser2.description).toBe(description);
        expect(wishlistUser2.type).toBe(publicType());
    });

    it("should not allow adding wishlist to other user", async () => {
        await expect((async () => {
            await wishlistService.add(
                user2,
                user1Id,
                "title",
                "description",
            );
        })()).rejects.toThrowError(errorMessages.unauthorizedToAddWishlist.message);
    });
});

describe("adding wishlist items", () => {
    it("should add items with correct info", async () => {
        item1user1Id = await wishlistService.item.add(
            user1, 
            wishlistUser1Id1, 
            "user1Item1", 
            "test"
        );
        
        expect(item1user1Id).toBeGreaterThan(0);

        const item = await wishlistService.item.getById(user1, item1user1Id);
        expect(item.id).toBe(item1user1Id);
    });

    it("should not allow adding items to other users wishlists", async () => {
        await expect((async () => {
            await wishlistService.item.add(
                user2,
                wishlistUser1Id1,
                "title",
                "description"
            );
        })()).rejects.toThrowError(errorMessages.unauthorizedToUpdateWishlist.message);
    });

    it("should allow admins to add items to other users wishlists", async () => {
        const item2user1Id = await wishlistService.item.add(
            admin, 
            wishlistUser1Id1, 
            "user1Item1", 
            "test"
        );
        
        expect(item2user1Id).toBeGreaterThan(0);
    });

    it("should not allow adding less than one item", async () => {
        await expect((async () => {
            await wishlistService.item.add(
                user1,
                wishlistUser1Id1,
                "title",
                "description",
                0
            );
        })()).rejects.toThrowError(errorMessages.unableToAddLessThanOneItem.message);
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
        await wishlistService.setType(user1, wishlistUser1Id2, hiddenType());
        
        let wishlists = await wishlistService.getByUserId(user2, user1Id);
        expect(wishlists.length).toBe(1);
        
        wishlists = await wishlistService.getByUserId(user1, user1Id);
        expect(wishlists.length).toBe(2);

        wishlists = await wishlistService.getByUserId(admin, user1Id);
        expect(wishlists.length).toBe(2);
    });

    it("should generate same error when finding hidden as well as nonexisting wishlist", async () => {
        const expectedErrorMessage = errorMessages.wishlistNotFound.message;

        await expect((async () => {
            await wishlistService.getById(
                user2,
                wishlistUser1Id2
            );
        })()).rejects.toThrowError(expectedErrorMessage);
        
        await expect((async () => {
            await wishlistService.getById(
                user2,
                -1
            );
        })()).rejects.toThrowError(expectedErrorMessage);
    });
});

describe("finding wishlist items", async () => {
    // Note: wishlistUser1Id2 is hidden

    it("should find items in wishlist", async () => {
        item2user1Id = await wishlistService.item.add(
            user1, 
            wishlistUser1Id2, 
            "user1Item1", 
            "test"
        );

        const items = await wishlistService.getItems(user1, wishlistUser1Id2);
        expect(items.length).toBe(1);
    });
    
    it("should not find items of hidden wishlist unless admin or owner through getItems", async () => {
        await expect((async () => {
            await wishlistService.getItems(user2, wishlistUser1Id2);
        })()).rejects.toThrowError(errorMessages.wishlistNotFound.message);
        
        const items = await wishlistService.getItems(admin, wishlistUser1Id2);
        expect(items.length).toBe(1);
    });

    it("should not find items of hidden wishlist unless admin or owner through item.getBy* functions", async () => {
        await expect((async () => {
            await wishlistService.item.getById(user2, item2user1Id);
        })()).rejects.toThrowError(errorMessages.wishlistItemNotFound.message);
        
        const item = await wishlistService.item.getById(admin, item2user1Id);
        expect(item.id).toBe(item2user1Id);
        
        await expect((async () => {
            await wishlistService.item.getByWishlistId(user2, wishlistUser1Id2);
        })()).rejects.toThrowError(errorMessages.wishlistNotFound.message);
        
        const items = await wishlistService.item.getByWishlistId(admin, wishlistUser1Id2);
        expect(items.length).toBe(1);
    });

    it("should generate same error when finding hidden as well as nonexisting wishlist item", async () => {
        const expectedErrorMessage = errorMessages.wishlistItemNotFound.message;

        await expect((async () => {
            await wishlistService.item.getById(
                user2,
                wishlistUser1Id2
            );
        })()).rejects.toThrowError(expectedErrorMessage);
        
        await expect((async () => {
            await wishlistService.item.getById(
                user2,
                -1
            );
        })()).rejects.toThrowError(expectedErrorMessage);
    });
});

describe("removing wishlist items", () => {
    it("should not allow user to remove others wishlist items", async () => {
        await expect((async () => {
            await wishlistService.item.remove(user2, item1user1Id);
        })()).rejects.toThrowError(errorMessages.unauthorizedToUpdateWishlist.message);
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
        await expect((async () => {
            await wishlistService.remove(
                user1,
                wishlistAdminId
            );
        })()).rejects.toThrowError(errorMessages.unauthorizedToDeleteWishlist.message);
    });

    it("should allow removing own wishlists", async () => {
        await wishlistService.remove(
            user1,
            wishlistUser1Id1
        );
    });

    it("should allow admins to remove any wishlist", async () => {
        await wishlistService.remove(
            admin,
            wishlistUser1Id2
        );
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