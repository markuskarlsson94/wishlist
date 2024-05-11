import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import users from "../users.js";
import userRoles from "../roles.js";

const authRouter = express.Router();

authRouter.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    bcrypt.compare(password, user.password, (error, match) => {
        if (error) return res.status(500).json({ message: 'Server error' });

        if (match) {
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);
            res.json({ accessToken, refreshToken });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    });
});

authRouter.post("/register", async (req, res) => {
    const { username, password } = req.body;

    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
        res.status(400).json({ message: 'Username already exists' });
        return;
    }

    try {
        const hashedPassword = await generatePassword(password);

        const newUser = {
            username,
            password: hashedPassword,
            role: userRoles.CUSTOMER
        };

        users.push(newUser);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.log(error);
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
        const user = users.find((u) => u.username === decoded.username);

        if (!user) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        const accessToken = generateAccessToken(user);
        res.json({ accessToken });
    } catch (error) {
        return res.status(401).json({ message: 'Invalid refresh token' });
    }
});

const generateAccessToken = (user) => {
    const payload = { username: user.username };
    return jwt.sign(payload, process.env.ACCESS_SECRET_KEY, { expiresIn: '30s' });
}

const generateRefreshToken = (user) => {
    const payload = { username: user.username };
    return jwt.sign(payload, process.env.REFRESH_SECRET_KEY, { expiresIn: '7d' });
}

const generatePassword = async (password) => {
    return (await bcrypt.hash(password, 10));
}

export default authRouter;