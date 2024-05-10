import express, { json } from "express";
import dotenv from "dotenv";
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import users from "./users.js";

dotenv.config();

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.ACCESS_SECRET_KEY
};

passport.use(new JwtStrategy(options, (payload, done) => {
    const user = users.find(u => u.username === payload.username);

    if (user) {
        return done(null, user);
    }

    return done(null, false)
}));

const app = express();

app.use(json());
app.use(passport.initialize());

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server started on port ${port}.`);
});

app.post("/login", (req, res) => {
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

app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
        res.status(400).json({ message: 'Username already exists' });
        return;
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            username,
            password: hashedPassword
        };

        users.push(newUser);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post("/refresh", (req, res) => {
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

const isAuthenticated = () => {
    return passport.authenticate('jwt', { session: false });
}

app.get('/protected', isAuthenticated(), (req, res) => {
    res.json({ 
        message: 'Success', 
        username: req.username 
    });
});

const generateAccessToken = (user) => {
    const payload = { username: user.username };
    return jwt.sign(payload, process.env.ACCESS_SECRET_KEY, { expiresIn: '30s' });
}

const generateRefreshToken = (user) => {
    const payload = { username: user.username };
    return jwt.sign(payload, process.env.REFRESH_SECRET_KEY, { expiresIn: '7d' });
}