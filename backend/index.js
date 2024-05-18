import "./loadEnv.js";
import express, { json } from "express";
import passport from "./passport.js";
import authRouter from "./routers/authRouter.js";
import dataRouter from "./routers/dataRouter.js";

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
    console.log(`Server started and listening on port ${port}.`);
});