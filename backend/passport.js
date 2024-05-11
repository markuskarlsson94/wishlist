import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

import users from "./users.js";
import userRoles from "./roles.js";

export const passportInit = () => {
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

export default passport;