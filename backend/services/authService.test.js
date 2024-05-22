import { afterAll, beforeAll, expect, describe, it, expectTypeOf } from "vitest";
import authService from "./authService";
import db from "../db";
import userService from "./userService";

const email1 = "test1@mail.com";
const email2 = "test2@mail.com";
const firstName = "Test";
const lastName = "Testsson";
const password = "abc";
let refreshToken;
const invalidRefreshToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

beforeAll(async () => {
    await db.connect();
    await db.init();
});

afterAll(async () => {
    await db.disconnect();
});

describe("registering user", () => {
    it("should create new user", async () => {
        expect((await userService.exists(email1))).toBeFalsy();
        await authService.register(email1, firstName, lastName, password);
        expect((await userService.exists(email1))).toBeTruthy();
    });

    it("should not register exisiting user", async () => {
        await expect((async () => {
            await authService.register(email1, "Foo", "Bar", password);
        })()).rejects.toThrowError("User already exist.");
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
        })()).rejects.toThrowError("Invalid email or password");
    });
    
    it("should not log in nonexisting user", async () => {
        await expect((async () => {
            await authService.login("a@mail.com", "incorrectPassword");
        })()).rejects.toThrowError("Invalid email or password");
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
        })()).rejects.toThrowError("Invalid refresh token");
    });

    it("should issue new access token with valid refresh token", async () => {
        const res = await authService.refresh(refreshToken);
        expectTypeOf(res.accessToken).toBeString(); 
    });
});