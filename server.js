import express from "express";
import Stripe from "stripe";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const stripe = new Stripe("sk_test_YOUR_SECRET_KEY"); // Replace with your secret key

app.use(bodyParser.json());
app.use(cors());

// Map service to base cost
const servicePrices = {
  Plumbing: 50,
  Electrical: 50,
  Painting: 30,
  Gardening: 20,
  Cleaning: 20,
  Appliances: 30,
  Carpentry: 30,
  Plastering: 30,
  Furniture: 30,
  Other: 20
};

// Endpoint to create payment intent
app.post("/create-payment-intent", async (req, res) => {
  try {
    const { service, urgent } = req.body;
    const serviceCost = servicePrices[service] || 80;
    const urgencyFee = urgent ? 40 : 0;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round((serviceCost + urgencyFee) * 100), // in cents
      currency: "aud",
      automatic_payment_methods: { enabled: true },
      metadata: {
        service,
        urgent: urgent ? "Yes" : "No",
        serviceCost,
        urgencyFee
      }
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
});

// Endpoint to log orders after successful payment (optional)
app.post("/log-order", async (req, res) => {
  try {
    console.log("New Order:", req.body); // You can save to DB here
    res.send({ success: true });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
