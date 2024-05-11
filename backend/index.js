import express, { json } from "express";
import dotenv from "dotenv";

import passport, { passportInit } from "./passport.js";
import authRouter from "./routers/authRouter.js";
import dataRouter from "./routers/dataRouter.js";

dotenv.config();
passportInit();

const app = express();
app.use(json());
app.use(passport.initialize());
app.use("/auth", authRouter);
app.use("/data", dataRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server started and listening on port ${port}.`);
});