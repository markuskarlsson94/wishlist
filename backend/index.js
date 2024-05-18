import "./loadEnv.js";
import express, { json } from "express";
import passport from "./passport.js";
import db from "./db.js";
import authRouter from "./routers/authRouter.js";
import dataRouter from "./routers/dataRouter.js";
import logger from "./logger.js";

db.connect();

const app = express();
app.use(json());
app.use(passport.initialize());
app.disable("x-powered-by");

const router = express.Router();
router.use("/auth", authRouter);
router.use("/data", dataRouter);
app.use("/api/v1", router);

const port = process.env.PORT || 3000;

app.listen(port, () => {
	logger.info(`Server started and listening on port ${port}.`);
});