import "./loadEnv.js";
import express, { json } from "express";
import passport from "./passport.js";
import db from "./db.js";
import authRouter from "./routers/authRouter.js";
import userRouter from "./routers/userRouter.js";
import logger from "./logger.js";
import { initUserRoles } from "./roles.js";
import { initWishlistTypes } from "./wishlistTypes.js";

db.connect();

const app = express();
app.use(json());
app.use(passport.initialize());
app.disable("x-powered-by");

const router = express.Router();
router.use("/auth", authRouter);
router.use("/user", userRouter);
app.use("/api/v1", router);

const port = process.env.PORT || 3000;

app.listen(port, () => {
	logger.info(`Server started and listening on port ${port}.`);
});

await initUserRoles();
await initWishlistTypes();