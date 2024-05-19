import jwt from "jsonwebtoken";
import logger from "../logger.js";
import ErrorMessage from "../errors/ErrorMessage.js";
import { passwordsMatching } from "../utilities/password.js";
import userService from "./userService.js";

const authService = {
    register: async (username, email, password) => {
        const userExists = await userService.exists(username, email);
        
        if (userExists) {
            throw new ErrorMessage(400, "User already exist.");
        }

        try {
            userService.add(username, email, password);
            logger.info(`New user ${username} registred.`);
        } catch (error) {
            logger.debug(error);
            throw new ErrorMessage(500, "Server error");
        }
    },

    login: async (username, password) => {
        const user = await userService.getByUsername(username);

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

    refresh: async (refreshToken) => {
        if (!refreshToken) {
            throw new ErrorMessage(400, "Refresh token required");
        }
    
        try {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
            const user = await userService.getById(decoded.id);
    
            if (!user) {
                throw new ErrorMessage(401, "Invalid refresh token");
            }
    
            logger.info(`User (id = ${user.id}) requested new refresh token.`);
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