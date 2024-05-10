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
            const payload = { username };
            const token = jwt.sign(payload, process.env.ACCESS_SECRET_KEY, { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    });
});

app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({ 
        message: 'Success', 
        username: req.username 
    });
});