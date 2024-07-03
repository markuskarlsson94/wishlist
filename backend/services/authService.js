import jwt from "jsonwebtoken";
import logger from "../logger.js";
import ErrorMessage from "../errors/ErrorMessage.js";
import { passwordsMatching } from "../utilities/password.js";
import userService from "./userService.js";
import errorMessages from "../errors/errorMessages.js";

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
            logger.info(`User ${user.email} logged in.`);
            
            return {
                accessToken,
                refreshToken,
            } 
        } else {
            throw new ErrorMessage(errorMessages.invalidEmailOrPassword);
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
    
            logger.info(`User (id = ${user.id}) requested new refresh token.`);
            return generateAccessToken(user);
        } catch (error) {
            logger.error(error.message);
            throw new ErrorMessage(errorMessages.invalidRefreshToken);
        }
    }
};

const generateAccessToken = (user, issuedAtLogin = false) => {
    const payload = { id: user.id, issuedAtLogin };
    return jwt.sign(payload, process.env.ACCESS_SECRET_KEY, { expiresIn: '10m' });
};

const generateRefreshToken = (user) => {
    const payload = { id: user.id };
    return jwt.sign(payload, process.env.REFRESH_SECRET_KEY, { expiresIn: '7d' });
};

export default authService;