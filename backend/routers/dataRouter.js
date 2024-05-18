import express from "express";

import { isAuthenticated, isAuthenticatedAdmin, verifyRecentLogin } from "../passport.js"
import dataService from "../services/dataService.js";

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
    try {
        const users = dataService.getUsers();
        res.json({ users });
    } catch (error) {   
        res.status(error.status).json(error.message);
    }
});

dataRouter.delete("/users/:userId", isAuthenticated(), verifyRecentLogin(), (req, res) => {
    const userId = Number(req.user.id);
    const userToDeleteId = Number(req.params.userId);

    try {
        dataService.deleteUser(userId, userToDeleteId);
        res.status(200).json({ message: "User successfully deleted" });
    } catch (error) {
        res.status(error.status).json(error.message);
    }
});

dataRouter.post("/updatePassword", isAuthenticated(), async (req, res) => {
    const { oldPassword, newPassword, newPasswordRepeated } = req.body;

    try {
        await dataService.updatePassword(
            req.user.id, 
            oldPassword, 
            newPassword, 
            newPasswordRepeated
        );

        res.status(200).json({ message: "Password updated" });
    } catch (error) {
        res.status(error.status).json(error.message);
    }
});

export default dataRouter;