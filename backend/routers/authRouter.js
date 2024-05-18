import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { addUser, findUserById, findUserByUsername, getUsers, updateUserPassword } from "../users.js";
import { isAuthenticated } from "../passport.js";
import logger from "../logger.js";

const authRouter = express.Router();

authRouter.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = findUserByUsername(username);

    if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    bcrypt.compare(password, user.password, (error, match) => {
        if (error) return res.status(500).json({ message: 'Server error' });

        if (match) {
            const accessToken = generateAccessToken(user, true);
            const refreshToken = generateRefreshToken(user);
            res.json({ accessToken, refreshToken });
            logger.info(`User ${user.username} logged in.`);
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    });
});

authRouter.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    const existingUser = getUsers().find(u => u.username === username || u.email === email);
    if (existingUser) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    try {
        const hashedPassword = await generatePassword(password);
        addUser(username, email, hashedPassword);
        res.status(201).json({ message: 'User registered successfully' });
        logger.info(`New user ${username} registred.`);
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

authRouter.post("/refresh", (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token required' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
        const user = findUserById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        const accessToken = generateAccessToken(user);
        res.json({ accessToken });
    } catch (error) {
        return res.status(401).json({ message: 'Invalid refresh token' });
    }
});

authRouter.post("/updatePassword", isAuthenticated(), (req, res) => {
    const { oldPassword, newPassword, newPasswordRepeated } = req.body;

    if (newPassword !== newPasswordRepeated) {
        return res.status(400).json({ message: "New passwords does not match" });
    }

    const userPassword = findUserById(req.user.id).password;

    bcrypt.compare(oldPassword, userPassword, async (error, match) => {
        if (error) return res.status(500).json({ message: 'Server error' });

        if (match) {
            const hashedPassword = await generatePassword(newPassword);
            updateUserPassword(req.user.id, hashedPassword);
            res.status(200).json({ message: "Password updated" });
        } else {
            res.status(400).json({ message: 'old password is incorrect' });
        }
    });
});

const generateAccessToken = (user, issuedAtLogin = false) => {
    const payload = { id: user.id, issuedAtLogin };
    return jwt.sign(payload, process.env.ACCESS_SECRET_KEY, { expiresIn: '1m' });
}

const generateRefreshToken = (user) => {
    const payload = { id: user.id };
    return jwt.sign(payload, process.env.REFRESH_SECRET_KEY, { expiresIn: '7d' });
}

const generatePassword = async (password) => {
    return (await bcrypt.hash(password, 10));
}

export default authRouter;