import express from "express";

import { isAuthenticated, isAuthenticatedAdmin } from "../passport.js"

const dataRouter = express.Router();

dataRouter.get('/customer', isAuthenticated(), (req, res) => {
    res.json({ 
        message: 'Success', 
        username: req.username 
    });
});


dataRouter.get('/admin', isAuthenticatedAdmin(), (req, res) => {
    res.json({ 
        message: 'Success', 
        username: req.username 
    });
});

export default dataRouter;