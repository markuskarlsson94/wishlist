import express from "express";

import { isAuthenticated, isAuthenticatedAdmin, verifyRecentLogin } from "../passport.js"
import userService from "../services/userService.js";
import wishlistService from "../services/wishlistService.js";

const userRouter = express.Router();

userRouter.get('/userData', isAuthenticated(), (req, res) => {
    res.json({ 
        message: 'Success', 
    });
});


userRouter.get('/adminData', isAuthenticatedAdmin(), (req, res) => {
    res.json({ 
        message: 'Success', 
    });
});

userRouter.get("/all", async (_req, res) => {
    try {
        const users = await userService.getAll();
        res.json({ users });
    } catch (error) {   
        res.status(error.status).json(error.message);
    }
});

userRouter.post("/add", async (req, res) => {
    try {
        const { email, firstName, lastName, password } = req.body;
        const id = await userService.add(email, firstName, lastName, password);

        res.status(201).json({ 
            message: "User successfully created.",
            id,
        });
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

userRouter.get("/roles", isAuthenticated(), async (_req, res) => {
    try {
        const roles = await userService.getUserRoles();
        res.status(200).json({ roles });
    } catch (error) {
        res.status(error.status).json(error.message);
    };
});

userRouter.get("/:userId/wishlists", isAuthenticated(), async (req, res) => {
    try {
        const wishlists = await wishlistService.getByUserId(req.params.userId);
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

userRouter.get("/wishlists", isAuthenticated(), async (_req, res) => {
    try {
        const wishlists = await wishlistService.getAll();
        res.status(200).json({ wishlists });
    } catch (error) {
        res.status(error.status).json(error.message);
    }
});

userRouter.delete("/:userId", isAuthenticated(), verifyRecentLogin(), async (req, res) => {
    const userId = Number(req.user.id);
    const userToDeleteId = Number(req.params.userId);

    try {
        await userService.remove(userId, userToDeleteId);
        res.status(200).json({ message: "User successfully deleted" });
    } catch (error) {
        res.status(error.status).json(error.message);
    }
});

export default userRouter;