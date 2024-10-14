import express from "express";
import wishlistService from "../services/wishlistService.js";
import { isAuthenticated } from "../passport.js";
import logger from "../logger.js";

const wishlistRouter = express.Router();

wishlistRouter.get("/wishlists", isAuthenticated(), async (_req, res) => {
    try {
        const wishlists = await wishlistService.getAll();
        res.status(200).json({ wishlists });
    } catch (error) {
        res.status(error.status).json(error.message);
    }
});

wishlistRouter.post("/wishlist", isAuthenticated(), async (req, res) => {
    try {
        const { title, description, type } = req.body;
        const user = req.user;

        const id = await wishlistService.add(user, user.id, title, description, type);
        logger.info(`Wishlist (id: ${id}) created by user (id: ${user.id})`);
        
        res.status(201).json({
            message: "Wishlist created",
            id,
        });
    } catch (error) {
        res.status(error.status).json(error.message);
    }
});

wishlistRouter.patch("/wishlist/:id", async (req, res) => {
    try {
        await wishlistService.update(req.user, req.params.id, req.body);

        res.status(200).json({
            message: "Wishlist updated",
        });
    } catch (error) {    
        res.status(error.status).json(error.message);
    }
});

wishlistRouter.delete("/wishlist/:id", isAuthenticated(), async (req, res) => {
    try {
        const user = req.user;
        const id = req.params.id;

        await wishlistService.remove(user, id);
        logger.info(`Wishlist (id: ${id}) removed by user (id: ${user.id})`);
        
        res.status(200).json({
            message: "Wishlist removed",
        });
    } catch (error) {
        res.status(error.status).json(error.message);
    }
});

wishlistRouter.post("/item", isAuthenticated(), async (req, res) => {
    try {
        const { wishlistId, title, description } = req.body; // TODO: Add amount
        const user = req.user;

        const id = await wishlistService.item.add(user, wishlistId, title, description);
        logger.info(`Wishlist item (id: ${id}) created by user (id: ${user.id})`);
        
        res.status(201).json({
            message: "Wishlist item created",
            id,
        });
    } catch (error) {
        res.status(error.status).json(error.message);
    }
});

wishlistRouter.get("/item/:id", isAuthenticated(), async (req, res) => {
    try {
        const user = req.user;
        const item = await wishlistService.item.getById(user, req.params.id);

        res.status(200).json({
            item,
        });
    } catch (error) {
        res.status(error.status).json(error.message);
    }
});

wishlistRouter.get("/item/:id/owner", isAuthenticated(), async (req, res) => {
    try {
        const user = req.user;
        const owner = await wishlistService.item.getOwner(user, req.params.id);

        res.status(200).json({
            owner,
        });
    } catch (error) {
        res.status(error.status).json(error.message);
    }
});

wishlistRouter.get("/item/:id/reservation", isAuthenticated(), async (req, res) => {
    try {
        const itemId = req.params.id;
        const user = req.user;

        const data = await wishlistService.reservation.getByUserIdAndItemId(user, user.id, itemId);
        
        res.status(200).json({ reservation: data });
    } catch (error) {
        res.status(error.status).json(error.message);
    }
});

wishlistRouter.delete("/item/:id", isAuthenticated(), async (req, res) => {
    try {
        const user = req.user;
        const id = req.params.id;

        await wishlistService.item.remove(user, id);
        logger.info(`Wishlist item (id: ${id}) removed by user (id: ${user.id})`);
        
        res.status(200).json({
            message: "Wishlist item removed",
        });
    } catch (error) {
        res.status(error.status).json(error.message);
    }
});

wishlistRouter.post("/item/:id/reserve", isAuthenticated(), async (req, res) => {
    try {
        // const { amount } = req.body; // TODO: implement amount
        const id = req.params.id;
        const user = req.user;

        const reservation = await wishlistService.item.reserve(user, id);
        logger.info(`Wishlist item (id: ${id}) reserved by user (id: ${user.id})`);
        
        res.status(200).json({
            message: "Wishlist item reserved",
            reservation,
        });
    } catch (error) {
        res.status(error.status).json(error.message);
    }
});

wishlistRouter.get("/wishlist/types", isAuthenticated(), async (req, res) => {
    try {
        const types = await wishlistService.getTypes();
        
        res.status(200).json({
            types,
        });
    } catch (error) {
        console.log(error.message);
        res.status(error.status).json(error.message);
    }
});

wishlistRouter.get("/wishlist/:id", isAuthenticated(), async (req, res) => {
    try {
        const user = req.user;
        const wishlist = await wishlistService.getById(user, req.params.id);
        
        res.status(200).json({
            wishlist,
        });
    } catch (error) {
        res.status(error.status).json(error.message);
    }
});

wishlistRouter.get("/wishlist/:id/items", isAuthenticated(), async (req, res) => {
    try {
        const user = req.user;
        const items = await wishlistService.getItems(user, req.params.id);
        
        res.status(200).json({
            items,
        });
    } catch (error) {
        res.status(error.status).json(error.message);
    }
});

wishlistRouter.put("/wishlist/:id/type", isAuthenticated(), async (req, res) => {
    try {
        const user = req.user;
        await wishlistService.setType(user, req.params.id, req.body.type);
        
        res.status(200).json({
            message: "Wishlist type updated",
        });
    } catch (error) {
        res.status(error.status).json(error.message);
    }
});

wishlistRouter.get("/reservation/:id", isAuthenticated(), async (req, res) => {
    try {
        const user = req.user;
        const reservation = await wishlistService.reservation.getById(user, req.params.id);
        
        res.status(200).json({
            reservation,
        });
    } catch (error) {
        res.status(error.status).json(error.message);
    }
});

wishlistRouter.delete("/reservation/:id", isAuthenticated(), async (req, res) => {
    try {
        const user = req.user;
        await wishlistService.reservation.remove(user, req.params.id);
        
        res.status(200).json({
            message: "Reservation removed",
        });
    } catch (error) {
        res.status(error.status).json(error.message);
    }
});

export default wishlistRouter;