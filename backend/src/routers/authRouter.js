import express from "express";
import authService from "../services/authService.js";
import { isAuthenticated, passportErrors } from "../passport.js";
import { adminRole } from "../roles.js";
import { generateTokens } from "../services/authService.js";
import passport from "../passport.js";
import envConfig from "../envConfig.js";

const authRouter = express.Router();

authRouter.post("/login", async (req, res) => {
	const { email, password } = req.body;

	try {
		const { accessToken, refreshToken } = await authService.login(email, password);
		res.status(200).json({
			accessToken,
			refreshToken,
		});
	} catch (error) {
		res.status(error.status).json(error.message);
	}
});

authRouter.post("/logout", isAuthenticated(), async (req, res) => {
	try {
		await authService.logout(req.user, req.body.userId);
		res.status(200).json({ message: "User logged out" });
	} catch (error) {
		res.status(error.status).json(error.message);
	}
});

authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

authRouter.get("/google/callback", (req, res, next) => {
	passport.authenticate("google", { session: false }, async (err, user, info) => {
		if (err) return next(err);

		if (!user) {
			if (info?.error === passportErrors.userAlreadyExists) {
				return res.redirect(`${envConfig.getFrontendUrl()}?error=google_email_conflict`);
			}

			return res.redirect(`${envConfig.getFrontendUrl()}?error=unknown`);
		}

		try {
			const { accessToken, refreshToken } = await generateTokens(user);

			return res.redirect(
				`${envConfig.getFrontendUrl()}/authenticated?accessToken=${accessToken}&refreshToken=${refreshToken}`,
			);
		} catch (error) {
			res.status(error.status).json(error.message);
		}
	})(req, res, next);
});

authRouter.post("/refresh", async (req, res) => {
	const { refreshToken } = req.body;

	try {
		const tokens = await authService.refresh(refreshToken);
		res.json({ ...tokens });
	} catch (error) {
		res.status(error.status).json(error.message);
	}
});

authRouter.get("/me", isAuthenticated(), async (req, res) => {
	res.json({
		user: {
			id: req.user.id,
			isAdmin: req.user.role === adminRole(),
		},
	});
});

authRouter.post("/verify", async (req, res) => {
	try {
		const token = req.query.token;

		if (!token) {
			return res.status(400).json({
				message: "Missing token",
			});
		}

		await authService.verify(token);

		res.status(201).json({
			message: "User successfully verified",
		});
	} catch (error) {
		res.status(error.status).json(error.message);
	}
});

export default authRouter;
