import express from "express";
import authService from "../services/authService.js";
import { isAuthenticated } from "../passport.js";

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
        res.status(error.status).json(error.message)
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

authRouter.post("/register", async (req, res) => {
    const { email, firstName, lastName, password } = req.body;

    try {
        await authService.register(email, firstName, lastName, password);
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(error.status).json(error.message);
    }
});

authRouter.post("/refresh", async (req, res) => {
    const { refreshToken } = req.body;

    try {
        const tokens = await authService.refresh(refreshToken);
        res.json({...tokens});
    } catch (error) {
        res.status(error.status).json(error.message);
    }
});

authRouter.get("/me", isAuthenticated(), async (req, res) => {
    res.json({
        id: req.user.id
    });
});

export default authRouter;