import { afterAll, beforeAll, expect, describe, it, expectTypeOf } from "vitest";
import authService from "./authService";
import db from "../../db";
import userService from "./userService";
import errorMessages from "../../errors/errorMessages";
import { initUserRoles } from "../../roles";

const email1 = "authServiceTest1@mail.com";
const email2 = "authServiceTest2@mail.com";
const firstName = "AuthServiceFirstName";
const lastName = "AuthServiceLastName";
const password = "abc";
let refreshToken;
const invalidRefreshToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

beforeAll(async () => {
    await db.connect();
    await db.init();
    await initUserRoles();
});

afterAll(async () => {
    await db.disconnect();
});

describe("registering user", () => {
    it("DB should be empty before adding", async () => {
        const res = await userService.getAll();
        expect(res.length).toBe(0);
    });

    it("should create new user", async () => {
        expect((await userService.exists(email1))).toBeFalsy();
        await authService.register(email1, firstName, lastName, password);
        expect((await userService.exists(email1))).toBeTruthy();
    });

    it("should not register exisiting user", async () => {
        await expect((async () => {
            await authService.register(email1, "Foo", "Bar", password);
        })()).rejects.toThrowError(errorMessages.userAlreadyExists.message);
    });

    it("should register user with different mail but same name", async () => {
        expect((await userService.exists(email2))).toBeFalsy();
        await authService.register(email2, firstName, lastName, password);
        expect((await userService.exists(email2))).toBeTruthy();
    });
});

describe("logging in", () => {
    it("should not log in user with incorrect password", async () => {
        await expect((async () => {
            await authService.login(email1, "incorrectPassword");
        })()).rejects.toThrowError(errorMessages.invalidEmailOrPassword.message);
    });
    
    it("should not log in nonexisting user", async () => {
        await expect((async () => {
            await authService.login("a@mail.com", "incorrectPassword");
        })()).rejects.toThrowError(errorMessages.invalidEmailOrPassword.message);
    });

    it("should log in user with correct password", async () => {
        const res = await authService.login(email1, password);
        const accessToken = res.accessToken;
        refreshToken = res.refreshToken;

        expectTypeOf(accessToken).toBeString();
        expectTypeOf(refreshToken).toBeString();
    });
});

describe("refreshing token", () => {
    it("should not issue new access token with invalid refresh token", async () => {
        await expect((async () => {
            await authService.refresh(invalidRefreshToken);
        })()).rejects.toThrowError(errorMessages.invalidRefreshToken.message);
    });

    it("should issue new access token with valid refresh token", async () => {
        const res = await authService.refresh(refreshToken);
        expectTypeOf(res.accessToken).toBeString(); 
    });
});