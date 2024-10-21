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
        wishlistAdminId = await wishlistService.add(
            admin,
            adminId,
            wishlsitTitleAdmin,
            wishlistDescription,
        );
        
        wishlistUser1Id1 = await wishlistService.add(
            user1,
            user1Id,
            wishlistTitleUser,
            wishlistDescription,
        );
        
        wishlistUser1Id2 = await wishlistService.add(
            user1,
            user1Id,
            wishlistTitleUser,
            wishlistDescription,
        );

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
        await expect((async () => {
            await wishlistService.update(user2, wishlistUser1Id1, {
                title: "test",
                description: "test",
            });
        })()).rejects.toThrowError(errorMessages.unauthorizedToUpdateWishlist.message);
    });

    it("should not allow updating unallowed properties", async () => {
        const {id, owner, createdAt, updatedAt} = await wishlistService.getById(admin, wishlistUser1Id1);
        
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
        item1user1Id = await wishlistService.item.add(
            user1, 
            wishlistUser1Id1, 
            itemTitle, 
            itemDescription
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

describe("updating wishlist items", () => {
    it("should allow updating own item", async () => {
        let item = await wishlistService.item.getById(user1, item1user1Id);
        
        expect(item.title).toBe(itemTitle);
        expect(item.description).toBe(itemDescription);
        
        await wishlistService.item.update(user1, item1user1Id, {
            title: "New title",
            description: "New description",
        });
        
        item = await wishlistService.item.getById(user1, item1user1Id);

        expect(item.title).toBe("New title");
        expect(item.description).toBe("New description");
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
        await expect((async () => {
            await wishlistService.item.update(user2, item1user1Id, {
                title: "test",
                description: "test",
            });
        })()).rejects.toThrowError(errorMessages.unauthorizedToUpdateWishlistItem.message);
    });

    it("should not allow updating unallowed properties", async () => {
        const { id, wishlist, amount, createdAt, updatedAt } = await wishlistService.item.getById(user1, item1user1Id);

        await wishlistService.item.update(user1, item1user1Id, {
            id: -1,
            wishlist: -1,
            amount: -1,
            createdAt: "",
            updatedAt: "",
        })

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

    it("should not find friends-only wishlists unless user is owner, friend, or admin", async () => {
        const wishlistId = await wishlistService.add(user1, user1Id, "friendTest", "test", friendType());

        expect(await usersAreFriends(user1Id, user2Id)).toBeFalsy();

        await expect((async () => {
            await wishlistService.getById(user2, wishlistId);
        })()).rejects.toThrowError(errorMessages.wishlistNotFound.message);
        
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
                item2user1Id
            );
        })()).rejects.toThrowError(expectedErrorMessage);
        
        await expect((async () => {
            await wishlistService.item.getById(
                user2,
                -1
            );
        })()).rejects.toThrowError(expectedErrorMessage);
    });

    it("should find owner of item", async () => {
        const owner = await wishlistService.item.getOwner(user2, item1user1Id);
        expect(owner).toBe(user1Id);
    });

    it("should not find owner of item if hidden for other user", async () => {
        await expect((async () => {
            await wishlistService.item.getOwner(user2, item2user1Id);
        })()).rejects.toThrowError(errorMessages.wishlistItemNotFound.message);
    });
    
    it("should not find owner of nonexisiting item", async () => {
        await expect((async () => {
            await wishlistService.item.getOwner(user1, -1);
        })()).rejects.toThrowError(errorMessages.wishlistItemNotFound.message);
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
            await wishlistService.update(admin, wishlistAdminId, {
                type: hiddenType(),
            });
            
            await expect((async () => {
                await wishlistService.item.reserve(user1, item1AdminId);
            })()).rejects.toThrowError(errorMessages.wishlistItemNotFound.message);
            
            await wishlistService.update(admin, wishlistAdminId, {
                type: publicType(),
            });
        });
        
        it("should generate same error for trying to reserve hidden as well as nonexisting item", async () => {
            const expectedErrorMessage = errorMessages.reservationNotFound.message;
            
            await expect((async () => {
                await wishlistService.reservation.getById(user1, 0);
            })()).rejects.toThrowError(expectedErrorMessage);
            
            await wishlistService.update(admin, wishlistAdminId, {
                type: hiddenType(),
            });
            
            await expect((async () => {
                await wishlistService.reservation.getById(user1, item1AdminId);
            })()).rejects.toThrowError(expectedErrorMessage);
            
            await wishlistService.update(admin, wishlistAdminId, {
                type: publicType(),
            });
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
        itemId = await db.wishlist.item.add(wishlistId, "testItem", "test", 1);
    });

    it("should not allow adding comment for other user", async () => {
        await expect((async () => {
            await wishlistService.item.comment.add(user1, itemId, user2Id, "test comment");
        })()).rejects.toThrowError(errorMessages.unauthorizedToAddComment.message);
    });
    
    it("should not allow adding comment on hidden item", async () => {
        await wishlistService.update(admin, wishlistId, {
            type: hiddenType(),
        });
        
        await expect((async () => {
            await wishlistService.item.comment.add(user2, itemId, user2Id, "test comment");
        })()).rejects.toThrowError(errorMessages.wishlistItemNotFound.message);
        
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
        await expect((async () => {
            await wishlistService.item.comment.remove(user2, commentId);
        })()).rejects.toThrowError(errorMessages.unauthorizedToRemoveComment.message);
    });
    
    it("should not allow updating comment for other user", async () => {
        await expect((async () => {
            await wishlistService.item.comment.update(user2, commentId, "yeehaw 2");
        })()).rejects.toThrowError(errorMessages.unauthorizedToUpdateComment.message);
    });

    it("should allow user to update own comment", async () => {
        await wishlistService.item.comment.update(user1, commentId, "yeehaw 2");
        const comment = await wishlistService.item.comment.getById(user1, commentId);
        expect(comment.comment).toBe("yeehaw 2");
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
        
        await expect((async () => {
            await wishlistService.item.comment.getById(admin, commentId);
        })()).rejects.toThrowError(errorMessages.commentNotFound.message);
    });

    describe("anonymous comments", () => {
        beforeAll(async () => {
            await wishlistService.item.comment.add(user1, itemId, user1Id, "test comment 1"); // user1 is wishlist owner
            await wishlistService.item.comment.add(user2, itemId, user2Id, "test comment 2");
            await wishlistService.item.comment.add(user3, itemId, user3Id, "test comment 3");
            await wishlistService.item.comment.add(user2, itemId, user2Id, "test comment 4");
        });
        
        it("should anonymize comments successfully for other user", async () => {
            const comments = await wishlistService.item.comment.getByItemId(user4, itemId);
            expect(comments.length).toBe(4);
            
            expect(comments[0].anonymizedUserId).toBe(undefined);
            expect(comments[1].anonymizedUserId).toBe(1);
            expect(comments[2].anonymizedUserId).toBe(2);
            expect(comments[3].anonymizedUserId).toBe(1);
            
            expect(comments[0].comment).toBe("test comment 1");
            expect(comments[1].comment).toBe("test comment 2");
            expect(comments[2].comment).toBe("test comment 3");
            expect(comments[3].comment).toBe("test comment 4");
            
            expect(comments.every(c => c.user === undefined));
            expect(comments.every(c => c.isOwnComment === undefined));
        });
        
        it("should not anonymize own comment", async () => {
            const comments = await wishlistService.item.comment.getByItemId(user3, itemId);
            expect(comments.length).toBe(4);
            
            expect(comments[0].anonymizedUserId).toBe(undefined);
            expect(comments[1].anonymizedUserId).toBe(1);
            expect(comments[2].anonymizedUserId).toBe(undefined);
            expect(comments[3].anonymizedUserId).toBe(1);
            
            expect(comments[0].isOwnComment).toBe(undefined);
            expect(comments[1].isOwnComment).toBe(undefined);
            expect(comments[2].isOwnComment).toBe(true);
            expect(comments[3].isOwnComment).toBe(undefined);

            expect(comments[0].isItemOwner).toBe(true);
            expect(comments[1].isItemOwner).toBe(undefined);
            expect(comments[2].isItemOwner).toBe(undefined);
            expect(comments[3].isItemOwner).toBe(undefined);
            
            expect(comments[0].comment).toBe("test comment 1");
            expect(comments[1].comment).toBe("test comment 2");
            expect(comments[2].comment).toBe("test comment 3");
            expect(comments[3].comment).toBe("test comment 4");

            expect(comments.every(c => c.user === undefined));
        });

        it("should preserve original user for admin", async () => {
            const comments = await wishlistService.item.comment.getByItemId(admin, itemId);
            expect(comments.length).toBe(4);

            expect(comments[0].user).toBe(user1Id);
            expect(comments[1].user).toBe(user2Id);
            expect(comments[2].user).toBe(user3Id);
            expect(comments[3].user).toBe(user2Id);
            
            expect(comments[0].anonymizedUserId).toBe(undefined);
            expect(comments[1].anonymizedUserId).toBe(1);
            expect(comments[2].anonymizedUserId).toBe(2);
            expect(comments[3].anonymizedUserId).toBe(1);
            
            expect(comments[0].isOwnComment).toBe(undefined);
            expect(comments[1].isOwnComment).toBe(undefined);
            expect(comments[2].isOwnComment).toBe(undefined);
            expect(comments[3].isOwnComment).toBe(undefined);

            expect(comments[0].isItemOwner).toBe(true);
            expect(comments[1].isItemOwner).toBe(undefined);
            expect(comments[2].isItemOwner).toBe(undefined);
            expect(comments[3].isItemOwner).toBe(undefined);
            
            expect(comments[0].comment).toBe("test comment 1");
            expect(comments[1].comment).toBe("test comment 2");
            expect(comments[2].comment).toBe("test comment 3");
            expect(comments[3].comment).toBe("test comment 4");
        });
    });
});