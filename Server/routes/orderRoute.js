import express from "express";
import authUser from "../middlewares/authUser.js";
import { getAllOrders, getUserOrder, placeOrderCOD, placeOrderStripe } from "../controller/orderController.js";
import authSeller from "../middlewares/authSeller.js";

const orderRoute = express.Router();

orderRoute.post("/cod", authUser, placeOrderCOD);
orderRoute.post("/user", authUser, getUserOrder);
orderRoute.get("/seller", authSeller, getAllOrders);
orderRoute.post("/stripe", authUser, placeOrderStripe);
export default orderRoute;
