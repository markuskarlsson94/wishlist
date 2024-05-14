import express from "express";

import { isAuthenticated, isAuthenticatedAdmin } from "../passport.js"
import { getUsers } from "../users.js";

const dataRouter = express.Router();

dataRouter.get('/customer', isAuthenticated(), (req, res) => {
    res.json({ 
        message: 'Success', 
    });
});


dataRouter.get('/admin', isAuthenticatedAdmin(), (req, res) => {
    res.json({ 
        message: 'Success', 
    });
});

dataRouter.get("/users", (req, res) => {
    res.json(getUsers());
});

export default dataRouter;