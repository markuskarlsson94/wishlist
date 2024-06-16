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
            await wishlistService.getItems(user2, wishlistUser1Id2);
        })()).rejects.toThrowError(errorMessages.wishlistNotFound.message);
        
        const items = await wishlistService.getItems(admin, wishlistUser1Id2);
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

describe("reservations", () => {
    beforeAll(async () => {
        item1AdminId = await wishlistService.item.add(admin, wishlistAdminId, "item1AdminId", "test", 1);
        item2AdminId = await wishlistService.item.add(admin, wishlistAdminId, "item2AdminId", "test", 2);
        item3AdminId = await wishlistService.item.add(admin, wishlistAdminId, "item3AdminId", "test", 3);
        item4AdminId = await wishlistService.item.add(admin, wishlistAdminId, "item4AdminId", "test");
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
            await expect((async () => {
                await wishlistService.item.reserve(user1, 0);
            })()).rejects.toThrowError(errorMessages.wishlistItemNotFound.message);
        });
        
        it("should not allow user to reserve own item", async () => {
            await expect((async () => {
                await wishlistService.item.reserve(admin, item1AdminId);
            })()).rejects.toThrowError(errorMessages.unableToReserveOwnItem.message);
        });
        
        it("should not allow user to reserve hidden item", async () => {
            await wishlistService.setType(admin, wishlistAdminId, hiddenType());
            
            await expect((async () => {
                await wishlistService.item.reserve(user1, item1AdminId);
            })()).rejects.toThrowError(errorMessages.wishlistItemNotFound.message);
            
            await wishlistService.setType(admin, wishlistAdminId, publicType());
        });
        
        it("should generate same error for trying to reserve hidden as well as nonexisting item", async () => {
            const expectedErrorMessage = errorMessages.reservationNotFound.message;
            
            await expect((async () => {
                await wishlistService.reservation.getById(user1, 0);
            })()).rejects.toThrowError(expectedErrorMessage);
            
            await wishlistService.setType(admin, wishlistAdminId, hiddenType());
            
            await expect((async () => {
                await wishlistService.reservation.getById(user1, item1AdminId);
            })()).rejects.toThrowError(expectedErrorMessage);
            
            await wishlistService.setType(admin, wishlistAdminId, publicType());
        });
    
        it("should not allow user to reserve same item more than once", async () => {
            await wishlistService.item.reserve(user1, item2AdminId);
            
            await expect((async () => {
                await wishlistService.item.reserve(user1, item2AdminId);
            })()).rejects.toThrowError(errorMessages.itemAlreadyReservedByUser.message);
        });
        
        it("should not allow user to reserve less than one item", async () => {
            await expect((async () => {
                await wishlistService.item.reserve(user1, item1AdminId, 0);
            })()).rejects.toThrowError(errorMessages.amountToReserveTooSmall.message);
        });
    
        it("should not allow user to reserve more than available amount", async () => {
            await expect((async () => {
                await wishlistService.item.reserve(user1, item1AdminId, 2);
            })()).rejects.toThrowError(errorMessages.amountToReserveTooLarge.message);
        });
    });

    describe("clearing reservations", () => {
        it("should not allow user to clear other users reservations", async () => {
            await expect((async () => {
                await wishlistService.reservation.clearByUserId(user2, user1Id);
            })()).rejects.toThrowError(errorMessages.unauthorizedToClearReservations.message);
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
            
            const reservations = (await wishlistService.reservation.getByUserId(user1, user1Id));
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
            await expect((async () => {
                await wishlistService.item.reserve(user2, item1AdminId, 1);
            })()).rejects.toThrowError(errorMessages.amountToReserveTooLarge.message);
        });
    });

    describe("item amount after reservations", () => {
        it("should not change the amount for item owner after reservation", async () => {
            item3user1Id = await wishlistService.item.add(user1, wishlistUser1Id1, "item3user1Id", "test", 2);
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
        
        it("should not display item from wishlist if it has been fully reserved for other user", async () => {
            item4user1Id = await wishlistService.item.add(user1, wishlistUser1Id1, "item4user1Id", "test", 1);

            await wishlistService.item.reserve(user2, item4user1Id);
            
            await expect((async () => {
                await wishlistService.item.getById(user3, item4user1Id);
            })()).rejects.toThrowError(errorMessages.wishlistItemNotFound.message);
        });
        
        it("should display item for reserver even if its fully reserved", async () => {
            const item = await wishlistService.item.getById(user2, item4user1Id);
            expect(item.amount).toBe(0);
            expect(item.originalAmount).toBe(undefined);
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
            wishlist = await wishlistService.add(
                user3,
                user3Id,
                "wishlist1User3",
                "test"
            );

            item1Id = await wishlistService.item.add(user3, wishlist, "item1", "test");
            item2Id = await wishlistService.item.add(user3, wishlist, "item2", "test", 2);
        });

        afterAll(async () => {
            await wishlistService.remove(user3, wishlist);
        });

        it("should get items properly before reservation", async () => {
            let items = await wishlistService.getItems(user2, wishlist);
            expect(items.length).toBe(2);
            
            const item1 = items.find(item => item.id === item1Id);
            const item2 = items.find(item => item.id === item2Id);

            expect(item1.id).toBe(item1Id);
            expect(item2.id).toBe(item2Id);

            expect(item1.amount).toBe(1);
            expect(item1.originalAmount).toBe(undefined);
            expect(item2.amount).toBe(2);
            expect(item2.originalAmount).toBe(undefined);
        });
        
        it("should change amount after reservation for other user", async () => {
            await wishlistService.item.reserve(user1, item1Id);
            await wishlistService.item.reserve(user1, item2Id);

            let items = await wishlistService.getItems(user2, wishlist);
            expect(items.length).toBe(1);
            
            const item1 = items.find(item => item.id === item1Id);
            const item2 = items.find(item => item.id === item2Id);

            expect(item1).toBe(undefined);
            expect(item2.id).toBe(item2Id);

            expect(item2.amount).toBe(1);
            expect(item2.originalAmount).toBe(undefined);
        });

        it("should not change amount for owner after reservation", async () => {
            let items = await wishlistService.getItems(user3, wishlist);
            expect(items.length).toBe(2);
            
            const item1 = items.find(item => item.id === item1Id);
            const item2 = items.find(item => item.id === item2Id);

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

            const item1 = items.find(item => item.id === item1Id);
            const item2 = items.find(item => item.id === item2Id);

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

            const item1 = items.find(item => item.id === item1Id);
            const item2 = items.find(item => item.id === item2Id);

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
            await expect((async () => {
                await wishlistService.reservation.getById(user2, reservation1User1Id);
            })()).rejects.toThrowError(errorMessages.reservationNotFound.message);
            
            await expect((async () => {
                await wishlistService.reservation.getByUserId(user2, user1Id);
            })()).rejects.toThrowError(errorMessages.reservationNotFound.message);
        });
        
        it("should find other users reservations if admin", async () => {
            const reservation = await wishlistService.reservation.getById(admin, reservation1User1Id);
            expect(reservation.id).toBe(reservation1User1Id);
            
            const reservations = await wishlistService.reservation.getByUserId(admin, user1Id);
            expect(reservations.length).toBe(2);
        });
        
        it("should only find reservations by item id if admin", async () => {
            await expect((async () => {
                await wishlistService.reservation.getByItemId(user1, item1AdminId);
            })()).rejects.toThrowError(errorMessages.unauthorizedToViewReservations.message);
            
            const reservations = await wishlistService.reservation.getByItemId(admin, item3AdminId);
            expect(reservations.length).toBe(2);
        });
    });
    
    describe("removing reservations", () => {
        it("should not allow user to remove other users reservation", async () => {
            await expect((async () => {
                await wishlistService.reservation.remove(user2, reservation2User1Id);
            })()).rejects.toThrowError(errorMessages.reservationNotFound.message);
        });
        
        it("should allow admin to remove other users reservation", async () => {
            await wishlistService.reservation.remove(admin, reservation2User1Id);
        });
        
        it("should not allow user to remove nonexisting reservation", async () => {
            await expect((async () => {
                await wishlistService.reservation.remove(user1, 0);
            })()).rejects.toThrowError(errorMessages.reservationNotFound.message);
        });
        
        it("should remove reservations if wishlist item is removed", async () => {
            const reservationId = await wishlistService.item.reserve(user1, item4AdminId);
            let reservation = await wishlistService.reservation.getById(user1, reservationId);
        
            expect(reservation.id).toBe(reservationId);
            
            await wishlistService.item.remove(admin, item4AdminId);
            
            await expect((async () => {
                reservation = await wishlistService.reservation.getById(user1, reservationId);
            })()).rejects.toThrowError(errorMessages.reservationNotFound.message);
        });
        
        it("should remove reservation if wishlist is removed", async () => {
            wishlist2AdminId = await wishlistService.add(admin, adminId, "wishlist2Admin", "test");
            const itemId = await wishlistService.item.add(admin, wishlist2AdminId, "item", "test");
            const reservationId = await wishlistService.item.reserve(user1, itemId);
            
            let reservation = await wishlistService.reservation.getById(user1, reservationId);
            expect(reservation.id).toBe(reservationId);

            let reservations = await wishlistService.reservation.getByUserId(user1, user1Id);
            reservations = reservations.filter(r => r.id === reservationId);
            expect(reservations.length).toBe(1);
            
            await wishlistService.remove(admin, wishlist2AdminId);
            
            await expect((async () => {
                reservation = await wishlistService.reservation.getById(user1, reservationId);
            })()).rejects.toThrowError(errorMessages.reservationNotFound.message);
            
            reservations = await wishlistService.reservation.getByUserId(user1, user1Id);
            reservations = reservations.filter(r => r.id === reservationId);
            expect(reservations.length).toBe(0);
        });
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