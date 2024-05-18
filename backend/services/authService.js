import jwt from "jsonwebtoken";
import { addUser, getUsers, findUserByUsername, findUserById } from "../users.js";
import logger from "../logger.js";
import ErrorMessage from "../errors/ErrorMessage.js";
import { generatePassword, passwordsMatching } from "../utilities/password.js";

const authService = {
    register: async (username, email, password) => {
        if (getUsers().find(u => u.username === username || u.email === email)) {
            throw new ErrorMessage(400, "User already exist.");
        }

        try {
            const hashedPassword = await generatePassword(password);
            addUser(username, email, hashedPassword);
            logger.info(`New user ${username} registred.`);
        } catch (error) {
            logger.debug(error);
            throw new ErrorMessage(500, "Server error");
        }
    },

    login: async (username, password) => {
        const user = findUserByUsername(username);

        if (!user) {
            throw new ErrorMessage(401, "Invalid username or password");
        }

        let match = false;
        try {
            match = await passwordsMatching(password, user.password); 
        } catch (error) {
            logger.debug(error);
            throw new ErrorMessage(500, "Server error");
        }
        
        if (match) {
            const accessToken = generateAccessToken(user, true);
            const refreshToken = generateRefreshToken(user);
            logger.info(`User ${user.username} logged in.`);
            
            return {
                accessToken,
                refreshToken,
            } 
        } else {
            throw new ErrorMessage(401, "Invalid username or password");
        }
    },

    refresh: (refreshToken) => {
        if (!refreshToken) {
            throw new ErrorMessage(400, "Refresh token required");
        }
    
        try {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
            const user = findUserById(decoded.id);
    
            if (!user) {
                throw new ErrorMessage(401, "Invalid refresh token");
            }
    
            return generateAccessToken(user);
        } catch (error) {
            throw new ErrorMessage(401, "Invalid refresh token");
        }
    }
};

const generateAccessToken = (user, issuedAtLogin = false) => {
    const payload = { id: user.id, issuedAtLogin };
    return jwt.sign(payload, process.env.ACCESS_SECRET_KEY, { expiresIn: '1m' });
};

const generateRefreshToken = (user) => {
    const payload = { id: user.id };
    return jwt.sign(payload, process.env.REFRESH_SECRET_KEY, { expiresIn: '7d' });
};

export default authService;