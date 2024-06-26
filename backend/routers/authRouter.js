import express from "express";
import authService from "../services/authService.js";

const authRouter = express.Router();

authRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const { accessToken, refreshToken } = await authService.login(email, password);
        return res.status(200).json({
            accessToken,
            refreshToken,
        });
    } catch (error) {
        res.status(error.status).json(error.message)
    }
});

authRouter.post("/register", async (req, res) => {
    const { email, firstName, lastName, password } = req.body;

    try {
        await authService.register(email, firstName, lastName, password);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(error.status).json(error.message);
    }
});

authRouter.post("/refresh", async (req, res) => {
    const { refreshToken } = req.body;

    try {
        const accessToken = await authService.refresh(refreshToken);
        res.json({ accessToken });
    } catch (error) {
        res.status(error.status).json(error.message);
    }
});

export default authRouter;