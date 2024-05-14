import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from "jsonwebtoken";

import { findUserById } from "./users.js";
import userRoles from "./roles.js";

export const passportInit = () => {
    const options = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.ACCESS_SECRET_KEY
    };
    
    passport.use(new JwtStrategy(options, (payload, done) => {
        const user = findUserById(payload.id);
        
        if (user) {
            // passport sets req.user to the object in the second parameter
            return done(null, { 
                userId: user.id, 
                role: user.role 
            });
        }
        
        return done(null, false)
    }));
}

export const isAuthenticated = () => {
    return passport.authenticate('jwt', { session: false });
}

export const isAuthenticatedAdmin = () => {
    return (req, res, next) => {
        const authMiddleware = isAuthenticated();

        authMiddleware(req, res, (err) => {
            if (err) {
                return next(err);
            }

            if (req.user && req.user.role === userRoles.ADMIN) {
                return next();
            } else {
                return res.status(403).json({ 
                    message: "Access denied: Insufficient privileges" 
                });
            }
        });
    }
}

/*
    Verifies that the issuedAtLogin flag is set in the jwt.
    This is only true when the access token is generated at
    user login and makes sure that it wasn't issued by the 
    refresh token. Use to authorize sensitive requests.
*/
export const verifyRecentLogin = () => {
    return (req, res, next) => {
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized: Missing or invalid access token' });
        }

        const accessToken = authorizationHeader.split(' ')[1];
        const decoded = jwt.decode(accessToken, process.env.ACCESS_SECRET_KEY);

        if (decoded.issuedAtLogin) {
            return next();
        } else {
            return res.status(403).json({ 
                message: "Access expired: Login to request new access token" 
            });
        }
    }
}

export default passport;