import { afterAll, beforeAll, expect, describe, it } from 'vitest'
import userService from "./userService";
import db from "../../db";
import errorMessages from '../../errors/errorMessages';
import { initUserRoles } from '../../roles';

let user1;
let user2;
let user1Id;
let user2Id;

const email1 = "userServiceTest1@mail.com";
const email2 = "userServiceTest2@mail.com";
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