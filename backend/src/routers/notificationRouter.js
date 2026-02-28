import express from "express";
import { isAuthenticated } from "../passport.js";
import notificationService from "../services/notificationService.js";
import { StatusCodes } from "http-status-codes";

const notificationRouter = express.Router();

notificationRouter.delete("/:id", isAuthenticated(), async (req, res) => {
	const id = req.params.id;

	try {
		await notificationService.remove(req.user, id);
		res.status(StatusCodes.OK).json({ message: "Notification removed" });
	} catch (error) {
		res.status(error.status).json(error.message);
	}
});

notificationRouter.get("/types", isAuthenticated(), async (req, res) => {
	try {
		const types = await notificationService.getTypes();
		res.status(StatusCodes.OK).json({ types });
	} catch (error) {
		res.status(error.status).json(error.message);
	}
});

export default notificationRouter;
