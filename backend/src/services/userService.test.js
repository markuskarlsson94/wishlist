import { afterAll, beforeAll, expect, describe, it } from 'vitest'
import userService from "./userService";
import db from "../db";
import errorMessages from '../errors/errorMessages';
import { adminRole, initUserRoles } from '../roles';

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
        user1Id = await userService.add(email1, firstName, lastName, "abc");
        expect(user1Id).toBeGreaterThan(0);
        user1 = await userService.getById(user1Id);
        expect(user1.id).toBe(user1Id);

        const allUsers = await userService.getAll();
        expect(allUsers.length).toBe(1);
        
        const user = allUsers[0];
        expect(user.email).toBe(email1);
        expect(user.firstName).toBe(firstName);
        expect(user.lastName).toBe(lastName);
    });

    it("should make exists(email) return true", async () => {
        expect(await userService.exists(email1)).toBeTruthy();
    });

    it("should not allow adding user with existing email", async () => {
        await expect((async () => {
            await userService.add(email1, "Foo", "Bar", "abc");
        })()).rejects.toThrowError(errorMessages.unableToAddNewUser.message);
    });

    it("should add user with different email but same name", async () => {
        user2Id = await userService.add(email2, firstName, lastName, "abc");
        expect(user2Id).toBeGreaterThan(0);
        user2 = await userService.getById(user2Id);
        expect(user2.id).toBe(user2Id);
    });
});

describe("searching for user", async () => {
    it("should find user by id", async () => {
        const user = await userService.getById(user1Id);
        expect(user.id).toBe(user1Id);
        expect(user.email).toBe(email1);
        expect(user.firstName).toBe(firstName);
        expect(user.lastName).toBe(lastName);
    });
    
    it("should find user by email", async () => {
        const user = await userService.getByEmail(email1);
        expect(user.id).toBe(user1Id);
        expect(user.email).toBe(email1);
        expect(user.firstName).toBe(firstName);
        expect(user.lastName).toBe(lastName);
    });

    it("should not find nonexisting user", async () => {
        let user = await userService.getById(0);
        expect(user).toBe(undefined);
        
        user = await userService.getByEmail("a@mail.com");
        expect(user).toBe(undefined);
    });
});

describe("removing user", async () => {
    it("should not allow user to remove someone else", async () => {
        await expect((async () => {
            await userService.remove(user1, user2Id);
        })()).rejects.toThrowError(errorMessages.unauthorizedToDeleteOtherUser.message);
    });

    it("should not allow user to remove nonexisiting user", async () => {
        await expect((async () => {
            await userService.remove(user1, 0);
        })()).rejects.toThrowError(errorMessages.unauthorizedToDeleteOtherUser.message);
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
        adminId = await userService.add(emailAdmin, firstName, lastName, "abc", adminRole());
        admin = await userService.getById(adminId);
        
        user2Id = await userService.add(email2, firstName, lastName, "abc");
        user2 = await userService.getById(user2Id);
        
        user3Id = await userService.add(email3, firstName, lastName, "abc");
        user3 = await userService.getById(user3Id);
    });

    describe("adding friends", () => {
        it("should not allow adding same user as friend", async () => {
            await expect((async () => {
                await userService.friend.add(user1, user1Id, user1Id);
            })()).rejects.toThrowError(errorMessages.unableToAddSameUserAsFriend.message);
        });
        
        it("should correctly add friend", async () => {
            expect((await userService.friend.with(user1Id, user2Id))).toBeFalsy();
            await userService.friend.add(user1, user1Id, user2Id);
            expect((await userService.friend.with(user1Id, user2Id))).toBeTruthy();
        });
        
        it("should correctly add friend if order is reversed", async () => {
            expect((await userService.friend.with(user1Id, user3Id))).toBeFalsy();
            await userService.friend.add(user1, user3Id, user1Id);
            expect((await userService.friend.with(user1Id, user3Id))).toBeTruthy();
        });
        
        it("should not allow adding exisiting friends", async () => {
            await expect((async () => {
                await userService.friend.add(user1, user1Id, user2Id);
            })()).rejects.toThrowError(errorMessages.userAlreadyAddedAsFriend.message);
        });
        
        it("should not allow adding exisiting friends if order is reversed", async () => {
            await expect((async () => {
                await userService.friend.add(user1, user2Id, user1Id);
            })()).rejects.toThrowError(errorMessages.userAlreadyAddedAsFriend.message);
        });
        
        it("should not allow adding friend for other user", async () => {
            await expect((async () => {
                await userService.friend.add(user1, user2Id, user3Id);
            })()).rejects.toThrowError(errorMessages.unauthorizedToAddFriend.message);
        });
        
        it("should allow adding friend for other user if admin", async () => {
            expect((await userService.friend.with(user2Id, user3Id))).toBeFalsy();
            await userService.friend.add(admin, user2Id, user3Id);
            expect((await userService.friend.with(user2Id, user3Id))).toBeTruthy();
        });
        
        it("should not allow adding non existing user as friend", async () => {
            await expect((async () => {
                await userService.friend.add(user1, user1Id, -1);
            })()).rejects.toThrowError(errorMessages.serverError.message);
        });
    });

    describe("viewing friends", () => {
        it("should allow viewing friends of self", async () => {
            const res = (await userService.friend.getByUserId(user1, user1Id));
            expect(res.length).toBe(2);
        });
        
        it("should allow viewing friends of friends", async () => {
            const res = (await userService.friend.getByUserId(user1, user2Id));
            expect(res.length).toBe(2);
        });
        
        it("should not allow to view friends of non friends", async () => {
            await expect((async () => {
                await userService.friend.getByUserId(user1, adminId);
            })()).rejects.toThrowError(errorMessages.unauthorizedToViewFriends.message);
        });

        it("should allow admin to view friends of non friends", async () => {
            const res = (await userService.friend.getByUserId(admin, user1Id));
            expect(res.length).toBe(2);
        });

        it("should not allow to view friends of non existing user", async () => {
            await expect((async () => {
                await userService.friend.getByUserId(user1, -1);
            })()).rejects.toThrowError(errorMessages.unauthorizedToViewFriends.message);
        });
    });

    describe("removing friends", () => {
        /*it("should not allow to remove non existing user as friend", async () => {
            await expect((async () => {
                await userService.friend.remove(user1, user1Id, -1);
            })()).rejects.toThrowError(errorMessages.unauthorizedToRemoveFriend.message);
        });*/
        
        it("should not allow to remove friends of other user", async () => {
            await expect((async () => {
                await userService.friend.remove(user1, user2Id, user3Id);
            })()).rejects.toThrowError(errorMessages.unauthorizedToRemoveFriend.message);
        });

        it("should allow admin to remove friends of other user", async () => {
            expect((await userService.friend.with(user2Id, user3Id))).toBeTruthy();
            await userService.friend.remove(admin, user2Id, user3Id);
            expect((await userService.friend.with(user2Id, user3Id))).toBeFalsy();
        });
        
        it("should not allow to remove same user as friend", async () => {
            await expect((async () => {
                await userService.friend.remove(user1, user1Id, user1Id);
            })()).rejects.toThrowError(errorMessages.unableToRemoveSameUserAsFriend.message);
        });
        
        it("should remove friend successfully", async () => {
            expect((await userService.friend.with(user2Id, user1Id))).toBeTruthy();
            await userService.friend.remove(user1, user1Id, user2Id);
            expect((await userService.friend.with(user2Id, user1Id))).toBeFalsy();
        });
        
        it("should remove friend successfully if order is reversed", async () => {
            await userService.friend.add(user1, user1Id, user2Id);
            
            expect((await userService.friend.with(user1Id, user2Id))).toBeTruthy();
            await userService.friend.remove(user1, user2Id, user1Id);
            expect((await userService.friend.with(user1Id, user2Id))).toBeFalsy();
        });
        
        it("should remove friendship if user is removed", async () => {
            await userService.friend.add(admin, user2Id, user3Id);
            expect((await userService.friend.with(user2Id, user3Id))).toBeTruthy();
            
            await userService.remove(admin, user3Id);
            expect((await userService.friend.with(user2Id, user3Id))).toBeFalsy();
        });
        
        /*it("should not allow to remove non friend", async () => {
            await expect((async () => {
                await userService.friend.remove(user1, user1Id, user2Id);
            })()).rejects.toThrowError(errorMessages.unableToRemoveSameUserAsFriend.message);
        });*/
    });
});