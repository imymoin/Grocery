import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from "stripe";
import User from "../models/User.js";

// Place Order COD: /api/order/cod

export const placeOrderCOD = async (req, res) => {
   try {
      const { userId, items, address } = req.body;
      if(!address || items.length === 0){
        return res.json({ success: false, message: "Invalid order details" });
      }

      // Calculate Amount
      let amount = await items.reduce(async (acc, item)=>{
        const product = await Product.findById(item.product);
        return (await acc) + (product.price * item.quantity);
      }, 0);

      //Add Tax Charges (2%)

      amount += Math.floor(amount * 0.02);

      await Order.create({
         userId,
         items,
         address,
         amount,
         paymentType: "COD",
      });

      return res.json({success: true, message: "Order placed successfully"});
   } catch (error) {
      console.error(error);
      res.json({success: false, message:error.message});
   }
}

//Place Order Stripe : /api/order/stripe

export const placeOrderStripe = async (req, res) => {
   try {
      const { userId, items, address } = req.body;
      const {origin} = req.headers;
      if(!address || items.length === 0){
        return res.json({ success: false, message: "Invalid order details" });
      }

      let productData = [];
      // Calculate Amount
      let amount = await items.reduce(async (acc, item)=>{
        const product = await Product.findById(item.product);
        productData.push({
         name: product.name,
         price:product.offPrice,
         quantity: item.quantity,
        });
        return (await acc) + (product.price * item.quantity);
      }, 0);

      //Add Tax Charges (2%)

      amount += Math.floor(amount * 0.02);

      const order = await Order.create({
         userId,
         items,
         address,
         amount,
         paymentType: "Online",
      });

      // Stripe Gateway Initialize
      const stripeInstance = new stripe(process.env.STRIPE_API_SECRET);

      //Create line items for stripe

      const line_items = productData.map((item)=>{
         return {
            price_data: {
               currency: "usd",
               product_data: {
                  name: item.name,
               },
               unit_amount:Math.floor(item.price + item.price * 0.02) * 100,
            },
            quantity: item.quantity,
         };
      });

      // create session

      const session = await stripeInstance.checkout.sessions.create({
         line_items,
         mode: "payment",
         success_url: `${origin}/loader?next=my-order`,
         cancel_url: `${origin}/cart`,
         metadata: {
            orderId: order._id,
            userId
         }
      });

      return res.json({success: true, sessionId: session.id});
   } catch (error) {
      console.error(error);
      res.json({success: false, message:error.message});
   }
}

//Stripe webhook to verify payment Action : /stripe

export const stripeWebhook = async (req, res) => {

   // Stripe Gateway Initialize
      const stripeInstance = new stripe(process.env.STRIPE_API_SECRET);

   const sig = req.headers['stripe-signature'];
   let event;

   try {
      event = stripeInstance.webhooks.constructEvent(
         req.body,
         sig,
         process.env.STRIPE_WEBHOOK_SECRET
      );
   } catch (error) {
      res.status(400).send(`Webhook Error: ${error.message}`);
   }

   // Handle the event
   switch (event.type) {
      case 'payment_intent.succeeded':{
         const paymentIntent = event.data.object;
         const paymentIntentId = paymentIntent.id;

         //Getting Session metadata
         const session = await stripeInstance.checkout.sessions.list({
            payment_intent: paymentIntentId
         });

         const {orderId, userId} = session.data[0].metadata;
         //Make Payment
         await Order.findByIdAndUpdate(orderId, { isPaid: true });
         await User.findByIdAndUpdate(userId, { cartItems: [] });
         break;
      }

      case "payment_intent.payment_failed": {
         const paymentIntent = event.data.object;
         const paymentIntentId = paymentIntent.id;

         //Getting Session metadata
         const session = await stripeInstance.checkout.sessions.list({
            payment_intent: paymentIntentId
         });

         const {orderId,} = session.data[0].metadata;
         //Make Payment
         await Order.findByIdAndDelete(orderId);
         break;
      }

      default:
         console.error(`Unhandled event type: ${event.type}`);
         break;
   }

   res.json({ received: true });
};

//Get order by User Id : /api/order/user

export const getUserOrder = async (req, res) => {
   try {
      const { userId } = req.body;
      const orders = await Order.find({ 
        userId,
        $or: [{paymentType: "COD"}, {isPaid: true}]
       }).populate("items.product address").sort({ createdAt: -1 });
      res.json({ success: true, orders });
   } catch (error) {
      console.error(error);
      res.json({ success: false, message: error.message });
   }
}

// Get All Orders ( for Seller/ admin): /api/order/seller

export const getAllOrders = async (req, res) => {
   try {
      const orders = await Order.find({ 
        $or: [{paymentType: "COD"}, {isPaid: true}]
       }).populate("items.product address").sort({ createdAt: -1 });
      res.json({ success: true, orders });
   } catch (error) {
      console.error(error);
      res.json({ success: false, message: error.message });
   }
}
