import "./loadEnv";
import express, { json } from "express";
import passport from "./passport";
import db from "./db";
import authRouter from "./routers/authRouter";
import userRouter from "./routers/userRouter";
import wishlistRouter from "./routers/wishlistRouter";
import logger from "./logger";
import { initUserRoles } from "./roles";
import { initWishlistTypes } from "./wishlistTypes";

db.connect(); // TODO: await?

const app = express();
app.use(json());
app.use(passport.initialize());
app.disable("x-powered-by");

const router = express.Router();
router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/", wishlistRouter);
app.use("/api/v1", router);

const port = process.env.PORT || 3000;

app.listen(port, () => {
	logger.info(`Server started and listening on port ${port}.`);
});

//await initUserRoles();
//await initWishlistTypes();

(async () => {
    await initUserRoles();
    await initWishlistTypes();
})();