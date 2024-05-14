import express from "express";

import { isAuthenticated, isAuthenticatedAdmin, verifyRecentLogin } from "../passport.js"
import { findUserById, getUsers, removeUser } from "../users.js";

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

dataRouter.delete("/users/:userId", isAuthenticated(), verifyRecentLogin(), (req, res) => {
    const userToDelete = findUserById(Number(req.params.userId))?.id;

    if (userToDelete === undefined) {
        return res.status(400).json({ message: "User not found" });
    }

    const currentUser = req.user.userId;

    if (currentUser !== userToDelete) {
        res.status(400).json({ message: "Unable to delete someone else" });
    } else {
        removeUser(userToDelete);
        res.status(200).json({ message: "User successfully deleted" });
    }
});

export default dataRouter;