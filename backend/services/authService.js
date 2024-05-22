import jwt from "jsonwebtoken";
import logger from "../logger.js";
import ErrorMessage from "../errors/ErrorMessage.js";
import { passwordsMatching } from "../utilities/password.js";
import userService from "./userService.js";

const authService = {
    register: async (email, firstName, lastName, password) => {
        const userExists = await userService.exists(email);
        if (userExists) {
            throw new ErrorMessage(400, "User already exist.");
        }

        try {
            await userService.add(email, firstName, lastName, password);
            logger.info(`New user ${email} registred.`);
        } catch (error) {
            logger.error(error.message);
            throw new ErrorMessage(500, "Server error");
        }
    },

    login: async (email, password) => {
        const user = await userService.getByEmail(email);

        if (!user) {
            throw new ErrorMessage(401, "Invalid email or password");
        }

        let match = false;

        try {
            match = await passwordsMatching(password, user.password); 
        } catch (error) {
            logger.error(error.message);
            throw new ErrorMessage(500, "Server error");
        }
        
        if (match) {
            const accessToken = generateAccessToken(user, true);
            const refreshToken = generateRefreshToken(user);
            logger.info(`User ${user.email} logged in.`);
            
            return {
                accessToken,
                refreshToken,
            } 
        } else {
            throw new ErrorMessage(401, "Invalid email or password");
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
            logger.error(error.message);
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