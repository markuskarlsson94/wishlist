import jwt from "jsonwebtoken";
import logger from "../logger.js";
import ErrorMessage from "../errors/ErrorMessage.js";
import { passwordsMatching } from "../utilities/password.js";
import userService, { canManageUser } from "./userService.js";
import errorMessages from "../errors/errorMessages.js";
import db from "../db.js";

const authService = {
    register: async (email, firstName, lastName, password) => {
        const userExists = await userService.exists(email);
        if (userExists) {
            throw new ErrorMessage(errorMessages.userAlreadyExists);
        }

        try {
            await userService.add(email, firstName, lastName, password);
            logger.info(`New user ${email} registred.`);
        } catch (error) {
            logger.error(error.message);
            throw new ErrorMessage(errorMessages.serverError);
        }
    },

    login: async (email, password) => {
        const user = await userService.getByEmail(email);

        if (!user) {
            throw new ErrorMessage(errorMessages.invalidEmailOrPassword);
        }

        let match = false;

        try {
            match = await passwordsMatching(password, user.password); 
        } catch (error) {
            logger.error(error.message);
            throw new ErrorMessage(errorMessages.serverError);
        }
        
        if (match) {
            const accessToken = generateAccessToken(user, true);
            const refreshToken = generateRefreshToken(user);

            try {
                await db.token.add(user.id, refreshToken);
            } catch (error) {
                logger.error(error.message);
                throw new Error("Unable to store token");
            }

            logger.info(`User ${user.email} logged in.`);
            
            return {
                accessToken,
                refreshToken,
            } 
        } else {
            throw new ErrorMessage(errorMessages.invalidEmailOrPassword);
        }
    },

    logout: async (user, userId) => {
        if (!canManageUser(user, userId)) {
            throw new ErrorMessage(errorMessages.unauthorizedToLogout);
        }

        try {
            await db.token.removeByUserId(userId);
            const { email } = await db.user.getById(userId);

            logger.info(`User ${email} logged out.`);
        } catch (error) {
            logger.error(error.message);
            throw new ErrorMessage(errorMessages.unableToLogout);
        }
    },

    refresh: async (refreshToken) => {
        if (!refreshToken) {
            throw new ErrorMessage(errorMessages.refreshTokenRequired);
        }
    
        try {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
            const user = await userService.getById(decoded.id);
    
            if (!user) {
                throw new ErrorMessage(errorMessages.invalidRefreshToken);
            }

            const storedToken = await db.token.getByUserId(decoded.id);
            
            if (!storedToken || storedToken !== refreshToken) {
                throw new ErrorMessage(errorMessages.invalidRefreshToken);
            }
            
            const accessToken = generateAccessToken(user);
            const newRefreshToken = generateRefreshToken(user);
            
            try {
                await db.token.add(user.id, newRefreshToken);
            } catch (error) {
                logger.error(error.message);
                throw new Error("Unable to store token");
            }

            logger.info(`User (id = ${user.id}) requested new tokens.`);

            return {
                accessToken,
                refreshToken: newRefreshToken,
            }
        } catch (error) {
            logger.error(error.message);
            throw new ErrorMessage(errorMessages.invalidRefreshToken);
        }
    }
};

const generateAccessToken = (user, issuedAtLogin = false) => {
    const payload = { id: user.id, issuedAtLogin };
    return jwt.sign(payload, process.env.ACCESS_SECRET_KEY, { expiresIn: '15m' });
};

const generateRefreshToken = (user) => {
    const payload = { id: user.id };
    return jwt.sign(payload, process.env.REFRESH_SECRET_KEY, { expiresIn: '1w' });
};

export default authService;