import express from "express";

import { isAuthenticated, isAuthenticatedAdmin, verifyRecentLogin } from "../passport.js";
import userService from "../services/userService.js";
import wishlistService from "../services/wishlistService.js";

const userRouter = express.Router();

userRouter.post("/register", async (req, res) => {
	const { email, firstName, lastName, password } = req.body;

	try {
		const token = await userService.add(email, firstName, lastName, password);
		console.log(token);
		res.status(201).json({ message: "User registered successfully" });
	} catch (error) {
		res.status(error.status).json(error.message);
	}
});

userRouter.get("/userData", isAuthenticated(), (req, res) => {
	res.json({
		message: "Success",
	});
});

userRouter.get("/adminData", isAuthenticatedAdmin(), (req, res) => {
	res.json({
		message: "Success",
	});
});

userRouter.get("/all", isAuthenticatedAdmin(), async (_req, res) => {
	try {
		const users = await userService.getAll();
		res.json({ users });
	} catch (error) {
		res.status(error.status).json(error.message);
	}
});

userRouter.post("/update-name", isAuthenticated(), async (req, res) => {
	try {
		const { firstName, lastName } = req.body;
		await userService.updateName(req.user, req.user.id, firstName, lastName);
		res.json({ message: "User name updated" });
	} catch (error) {
		res.status(error.status).json(error.message);
	}
});

userRouter.post("/update-password", isAuthenticated(), async (req, res) => {
	const { passwordCur, passwordNew, passwordNewRepeated } = req.body;

	try {
		await userService.updatePassword(req.user, req.user.id, passwordCur, passwordNew, passwordNewRepeated);

		res.status(200).json({ message: "Password updated" });
	} catch (error) {
		res.status(error.status).json(error.message);
	}
});

userRouter.post("/request-password-reset", async (req, res) => {
	const email = req.body.email;

	try {
		await userService.requestPasswordReset(email);
		res.status(200).json({ message: "Password reset requested" });
	} catch (error) {
		return res.status(error.status).json(error.message);
	}
});

userRouter.post("/reset-password", async (req, res) => {
	const { token, password: plaintextPassword } = req.body;

	try {
		await userService.resetPassword(token, plaintextPassword);
	} catch (error) {
		return res.status(error.status).json(error.message);
	}

	res.status(200).json({ message: "Password updated" });
});

userRouter.get("/search", isAuthenticated(), async (req, res) => {
	try {
		const query = req.query.query;
		const page = Number(req.query.page);

		if (query === undefined || page === undefined) {
			return res.status(400).json({ message: "'query' or 'page' parameters missing" });
		}

		const limit = 10;
		const data = await userService.getByFullName(query, limit, page * limit);

		res.status(200).json(data);
	} catch (error) {
		res.status(error.status).json(error.message);
	}
});

userRouter.get("/roles", isAuthenticated(), async (_req, res) => {
	try {
		const roles = await userService.getUserRoles();
		res.status(200).json({ roles });
	} catch (error) {
		res.status(error.status).json(error.message);
	}
});

userRouter.get("/:userId/sentfriendrequests", isAuthenticated(), async (req, res) => {
	try {
		const requests = await userService.friendRequest.getBySenderId(req.user, Number(req.params.userId));
		res.status(200).json({ requests });
	} catch (error) {
		res.status(error.status).json(error.message);
	}
});

userRouter.get("/:userId/receivedfriendrequests", isAuthenticated(), async (req, res) => {
	try {
		const requests = await userService.friendRequest.getByReceiverId(req.user, Number(req.params.userId));
		res.status(200).json({ requests });
	} catch (error) {
		res.status(error.status).json(error.message);
	}
});

userRouter.post("/friendrequest", isAuthenticated(), async (req, res) => {
	try {
		await userService.friendRequest.add(req.user, req.body.senderId, req.body.receiverId);
		res.status(200).json({ message: "Friend request created" });
	} catch (error) {
		res.status(error.status).json(error.message);
	}
});

userRouter.delete("/friendrequest/:id", isAuthenticated(), async (req, res) => {
	try {
		await userService.friendRequest.remove(req.user, req.params.id);
		res.status(200).json({ message: "Friend request deleted" });
	} catch (error) {
		res.status(error.status).json(error.message);
	}
});

userRouter.put("/friendrequest/:id/accept", isAuthenticated(), async (req, res) => {
	try {
		await userService.friendRequest.accept(req.user, req.params.id);
		res.status(200).json({ message: "Friend request accepted" });
	} catch (error) {
		res.status(error.status).json(error.message);
	}
});

userRouter.get("/:userId", isAuthenticated(), async (req, res) => {
	try {
		const user = await userService.getById(Number(req.params.userId));
		res.status(200).json({ user });
	} catch (error) {
		res.status(error.status).json(error.message);
	}
});

userRouter.get("/:userId/wishlists", isAuthenticated(), async (req, res) => {
	try {
		const wishlists = await wishlistService.getByUserId(req.user, Number(req.params.userId));
		res.status(200).json({ wishlists });
	} catch (error) {
		res.status(error.status).json(error.message);
	}
});

userRouter.get("/:userId/reservations", isAuthenticated(), async (req, res) => {
	try {
		const reservations = await wishlistService.reservation.getByUserId(req.user, Number(req.params.userId));
		res.status(200).json({ reservations });
	} catch (error) {
		res.status(error.status).json(error.message);
	}
});

userRouter.get("/:userId/friends", isAuthenticated(), async (req, res) => {
	const userId = Number(req.params.userId);

	try {
		const friends = await userService.friend.getByUserId(req.user, userId);
		res.status(200).json({ friends });
	} catch (error) {
		res.status(error.status).json(error.message);
	}
});

userRouter.delete("/friend/:id", isAuthenticated(), async (req, res) => {
	try {
		await userService.friend.remove(req.user, req.user.id, Number(req.params.id));
		res.status(200).json({ message: "Friend removed" });
	} catch (error) {
		res.status(error.status).json(error.message);
	}
});

userRouter.delete("/:userId", isAuthenticated(), verifyRecentLogin(), async (req, res) => {
	const userToDeleteId = Number(req.params.userId);

	try {
		await userService.remove(req.user, userToDeleteId);
		res.status(200).json({ message: "User successfully deleted" });
	} catch (error) {
		res.status(error.status).json(error.message);
	}
});

export default userRouter;
