import express from "express";
import authService from "../services/authService.js";
import { isAuthenticated } from "../passport.js";
import { adminRole } from "../roles.js";

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
