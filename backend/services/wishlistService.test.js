import { afterAll, beforeAll, expect, describe, it } from "vitest";
import db from "../db";
import wishlistService from "./wishlistService";
import { initUserRoles, adminRole, userRole } from "../roles";
import errorMessages from "../errors/errorMessages";

let adminId;
let userId;

let wishlistAdminId;
let wishlistUserId1;
let wishlistUserId2;

beforeAll(async () => {
    await db.connect();
    await db.init();
    await initUserRoles();    
});

afterAll(async () => {
    await db.disconnect();
});

describe("sanity check", async () => {
    it("should create users", async () => {
        adminId = await db.user.add("wishlistServiceTestAdmin@mail.com", "Admin", "Adminsson", "abc", adminRole());
        userId = await db.user.add("wishlistServiceTestUser@mail.com", "User", "Usersson", "abc", userRole());

        expect(adminId).toBeGreaterThan(0);
        expect(userId).toBeGreaterThan(0);
    });

    it("DB should be empty before adding", async () => {
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
            adminId,
            titleAdmin,
            description,
        );
        
        wishlistUserId1 = await wishlistService.add(
            userId,
            titleUser,
            description,
        );
        
        wishlistUserId2 = await wishlistService.add(
            userId,
            titleUser,
            description,
        );

        expect(wishlistAdminId).toBeGreaterThan(0);
        expect(wishlistUserId1).toBeGreaterThan(0);
        expect(wishlistUserId2).toBeGreaterThan(0);

        const wishlistAdmin = await wishlistService.getById(wishlistAdminId);

        expect(wishlistAdmin.id).toBe(wishlistAdminId);
        expect(wishlistAdmin.title).toBe(titleAdmin);
        expect(wishlistAdmin.description).toBe(description);
        
        const wishlistUser1 = await wishlistService.getById(wishlistUserId1);

        expect(wishlistUser1.id).toBe(wishlistUserId1);
        expect(wishlistUser1.title).toBe(titleUser);
        expect(wishlistUser1.description).toBe(description);
        
        const wishlistUser2 = await wishlistService.getById(wishlistUserId2);

        expect(wishlistUser2.id).toBe(wishlistUserId2);
        expect(wishlistUser2.title).toBe(titleUser);
        expect(wishlistUser2.description).toBe(description);
    });
});

describe("finding wishlists", () => {
    it("should find all wishlists", async () => {
        const wishlists = await wishlistService.getAll();
        expect(wishlists.length).toBe(3);
    });

    it("should find by userId", async () => {
        const wishlists = await wishlistService.getByUserId(userId);

        expect(wishlists.length).toBe(2);

        const wishlist = wishlists[0];
        expect(wishlist.id).toBe(wishlistUserId1);
    });
});

describe("removing wishlists", () => {
    it("should not allow user to remove others wishlists", async () => {
        await expect((async () => {
            await wishlistService.remove(
                { id: userId, role: userRole() },
                wishlistAdminId
            );
        })()).rejects.toThrowError(errorMessages.unauthorizedToDeleteWishlist.message);
    });

    it("should allow removing own wishlists", async () => {
        await wishlistService.remove(
            { id: userId, role: userRole() },
            wishlistUserId1
        );
    });

    it("should allow admins to remove any wishlisst", async () => {
        await wishlistService.remove(
            { id: adminId, role: adminRole() },
            wishlistUserId2
        );
    })
});