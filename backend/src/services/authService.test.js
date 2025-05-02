import { afterAll, beforeAll, expect, describe, it } from "vitest";
import authService from "./authService";
import db from "../db";
import userService from "./userService";
import errorMessages from "../errors/errorMessages";
import { initUserRoles, adminRole, userRole } from "../roles";

let admin;
let user1;
let user2;
const email1 = "authServiceTest1@mail.com";
const email2 = "authServiceTest2@mail.com";
const firstName = "AuthServiceFirstName";
const lastName = "AuthServiceLastName";
const password = "abc";
let refreshToken;
const invalidRefreshToken =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

beforeAll(async () => {
	await db.connect();
	await db.init();
	await initUserRoles();

	await userService.addWithoutVerification({ email: email1, firstName, lastName, plaintextPassword: password });
	await userService.addWithoutVerification({ email: email2, firstName, lastName, plaintextPassword: password });

	admin = { role: adminRole() };
});

afterAll(async () => {
	await db.disconnect();
});

describe("logging in", () => {
	it("should not log in user with incorrect password", async () => {
		await expect(
			(async () => {
				await authService.login(email1, "incorrectPassword");
			})(),
		).rejects.toThrowError(errorMessages.invalidEmailOrPassword.message);
	});

	it("should not log in nonexisting user", async () => {
		await expect(
			(async () => {
				await authService.login("a@mail.com", "incorrectPassword");
			})(),
		).rejects.toThrowError(errorMessages.invalidEmailOrPassword.message);
	});

	it("should log in user with correct password", async () => {
		const res = await authService.login(email1, password);
		refreshToken = res.refreshToken;

		expect(res).toHaveProperty("accessToken");
		expect(res).toHaveProperty("refreshToken");
	});
});

describe("logging out", async () => {
	let refreshToken2;

	beforeAll(async () => {
		user1 = await db.user.getByEmail(email1);
		user2 = await db.user.getByEmail(email2);

		const res = await authService.login(email2, password);
		refreshToken2 = res.refreshToken;
	});

	it("should not allow to log out other user", async () => {
		await expect(
			(async () => {
				await authService.logout(user1, user2.id);
			})(),
		).rejects.toThrowError(errorMessages.unauthorizedToLogout.message);
	});

	it("should allow admin to log out other user", async () => {
		await authService.logout(admin, user2.id);
	});

	it("should not allow refreshing tokens after logging out", async () => {
		await expect(
			(async () => {
				await authService.refresh(refreshToken2);
			})(),
		).rejects.toThrowError(errorMessages.invalidRefreshToken.message);
	});
});

describe("verification", () => {
	let email = "authServiceTest3@mail.com";
	let id;
	let token;

	it("should add user to waitlist after registration and receiving token", async () => {
		token = await userService.add(
			{ email, firstName, lastName, plaintextPassword: password, role: userRole() },
			false,
		);
		expect(token).toBeTruthy();

		const pendingUser = await db.waitlist.getUserByToken(token);
		expect(pendingUser.email).toBe(email);
	});

	it("should not add user before verification", async () => {
		const user = await db.user.getByEmail(email);
		expect(user).toBe(undefined);
	});

	it("should not be possible to register already registred user", async () => {
		await expect(
			userService.add({ email, firstName, lastName, plaintextPassword: password, role: userRole() }, false),
		).rejects.toThrowError(errorMessages.userAlreadyExists.message);
	});

	it("should not be possible to login before verification", async () => {
		await expect(authService.login(email, password)).rejects.toThrowError(
			errorMessages.invalidEmailOrPassword.message,
		);
	});

	it("should not be possible to verify using invalid token", async () => {
		await expect(authService.verify(email, "inavlidToken")).rejects.toThrowError(
			errorMessages.unableToVerifyUser.message,
		);
	});

	it("should not be possible to verify non existing user", async () => {
		await expect(authService.verify("test@test.com", "abc")).rejects.toThrowError(
			errorMessages.unableToVerifyUser.message,
		);
	});

	it("should verify and add user with correct token", async () => {
		await authService.verify(token);

		const user = await db.user.getByEmail(email);
		expect(user.email).toBe(email);

		id = user.id;
	});

	it("should remove user from waitlist after verification", async () => {
		const user = await db.waitlist.getUserByEmail(email);
		expect(user).toBe(undefined);
	});

	it("should be possible to login after verfication", async () => {
		await authService.login(email, password);
	});

	it("should not be possible to verify existing user", async () => {
		await expect(authService.verify(email, token)).rejects.toThrowError(errorMessages.unableToVerifyUser.message);
	});

	afterAll(async () => {
		db.user.remove(id);
	});
});

describe("refreshing token", () => {
	it("should not issue new access token with invalid refresh token", async () => {
		await expect(
			(async () => {
				await authService.refresh(invalidRefreshToken);
			})(),
		).rejects.toThrowError(errorMessages.invalidRefreshToken.message);
	});

	it("should issue new access and refresh token with valid refresh token", async () => {
		const res = await authService.refresh(refreshToken);
		expect(res).toHaveProperty("accessToken");
		expect(res).toHaveProperty("refreshToken");

		refreshToken = res.refreshToken;
	});

	it("should not issue new tokens using old refresh token", async () => {
		/*
            In order to prevent a stolen refresh token being used to 
            aqcuire access tokens indefinitely the auth service makes
            sure that a refresh token can only be used once. This is
            done by storing the newly generated refresh token upon a
            refresh request and requiring that only this token is used 
            to request new tokens.

            The JWT iat (issued at time) claim is measured in seconds.
            Two JWT's generated within a second can therefore be 
            identical since every claim will be the same.
            
            AuthService::refresh stores the provided refresh token and
            compares it to subsequentially used tokens to make sure that
            old ones aren't used again. Due to the iat property it can
            however be reused within a second and still be valid.

            To test that old tokens can't be used we must therefore add
            a delay before requesting new ones to make sure that a
            new token will be generated, hence the timeouts.
        */

		await new Promise((resolve) => {
			setTimeout(async () => {
				const res = await authService.refresh(refreshToken);
				expect(res).toHaveProperty("accessToken");
				expect(res).toHaveProperty("refreshToken");

				resolve();
			}, 1500);
		});

		/* 
            Since we didn't store the new refresh token and use it in
            the request below it will fail because authService::refresh
            expects the same token back.
        */

		await new Promise((resolve) => {
			setTimeout(async () => {
				await expect(
					(async () => {
						await authService.refresh(refreshToken);
					})(),
				).rejects.toThrowError(errorMessages.invalidRefreshToken.message);

				resolve();
			}, 1500);
		});
	});
});
