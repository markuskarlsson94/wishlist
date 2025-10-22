import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import { adminRole, userRole } from "./roles.js";
import db from "./db.js";
import logger from "./logger.js";

export const passportErrors = {
	userAlreadyExists: "User already exists",
};

const options = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: process.env.ACCESS_SECRET_KEY,
};

passport.use(
	new JwtStrategy(options, async (payload, done) => {
		const user = await db.user.getById(payload.id);

		if (user) {
			// passport sets req.user to the object in the second parameter
			return done(null, {
				id: user.id,
				role: user.role,
			});
		}

		return done(null, false);
	}),
);

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: process.env.GOOGLE_CALLBACK_URL,
		},
		async (_accessToken, _refreshToken, profile, done) => {
			try {
				const googleId = profile.id;
				const email = profile.emails?.[0]?.value;
				const firstName = profile.name.givenName;
				const lastName = profile.name.familyName;
				const profilePicture = profile.photos?.[0]?.value;

				let user = await db.user.getByGoogleId(googleId);

				if (email) {
					if (user) {
						await db.user.updateByGoogleId(googleId, firstName, lastName, profilePicture);
						logger.info(`User ${user.email} logged in`);
					} else {
						const existingUser = await db.user.getByEmail(email);

						if (existingUser) {
							return done(null, false, {
								error: passportErrors.userAlreadyExists,
							});
						}

						const userId = await db.user.addByGoogleId(
							profile.id,
							email,
							firstName,
							lastName,
							profilePicture,
							userRole(),
						);

						user = await db.user.getById(userId);

						logger.info(`User ${email} registred by Google`);
					}
				}

				done(null, { id: user.id, role: user.role });
			} catch (err) {
				done(err, null);
			}
		},
	),
);

export const isAuthenticated = () => {
	return passport.authenticate("jwt", { session: false });
};

export const isAuthenticatedAdmin = () => {
	return (req, res, next) => {
		const authMiddleware = isAuthenticated();

		authMiddleware(req, res, (err) => {
			if (err) {
				return next(err);
			}

			if (req.user && req.user.role === adminRole()) {
				return next();
			} else {
				return res.status(403).json({
					message: "Access denied: Insufficient privileges",
				});
			}
		});
	};
};

/*
    Verifies that the issuedAtLogin flag is set in the jwt.
    This is only true when the access token is generated at
    user login and makes sure that it wasn't issued by the 
    refresh token. Use to authorize sensitive requests.
*/
export const verifyRecentLogin = () => {
	return (req, res, next) => {
		const authorizationHeader = req.headers.authorization;

		if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
			return res.status(401).json({ message: "Unauthorized: Missing or invalid access token" });
		}

		const accessToken = authorizationHeader.split(" ")[1];
		const decoded = jwt.decode(accessToken, process.env.ACCESS_SECRET_KEY);

		if (decoded.issuedAtLogin) {
			return next();
		} else {
			return res.status(403).json({
				message: "Access expired: Login to request new access token",
			});
		}
	};
};

export default passport;
