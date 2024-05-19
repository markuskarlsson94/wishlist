import express from "express";

import { isAuthenticated, isAuthenticatedAdmin, verifyRecentLogin } from "../passport.js"
import userService from "../services/userService.js";

const userRouter = express.Router();

userRouter.get('/customer', isAuthenticated(), (req, res) => {
    res.json({ 
        message: 'Success', 
    });
});


userRouter.get('/admin', isAuthenticatedAdmin(), (req, res) => {
    res.json({ 
        message: 'Success', 
    });
});

userRouter.get("/users", async (_req, res) => {
    try {
        const users = await userService.getAll();
        res.json({ users });
    } catch (error) {   
        res.status(error.status).json(error.message);
    }
});

userRouter.post("/add", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const id = await userService.add(username, email, password);

        res.status(201).json({ 
            message: "User successfully created.",
            id,
        });
    } catch (error) {
        res.status(error.status).json(error.message);
    }
});

userRouter.delete("/users/:userId", isAuthenticated(), verifyRecentLogin(), async (req, res) => {
    const userId = Number(req.user.id);
    const userToDeleteId = Number(req.params.userId);

    try {
        await userService.remove(userId, userToDeleteId);
        res.status(200).json({ message: "User successfully deleted" });
    } catch (error) {
        res.status(error.status).json(error.message);
    }
});

userRouter.post("/updatePassword", isAuthenticated(), async (req, res) => {
    const { oldPassword, newPassword, newPasswordRepeated } = req.body;

    try {
        await userService.updatePassword(
            req.user.id, 
            oldPassword, 
            newPassword, 
            newPasswordRepeated
        );

        res.status(200).json({ message: "Password updated" });
    } catch (error) {
        res.status(error.status).json(error.message);
    }
});

export default userRouter;