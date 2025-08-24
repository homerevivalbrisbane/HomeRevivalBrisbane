// server.js
import express from "express";
import Stripe from "stripe";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const stripe = new Stripe("sk_test_51RzXEUS9s8DViJRGf8CPh2myvwvyMKEr2Tf63Ow3aCYMK62JGvoaE5n9aFrD6pUU7kkShxiBqRnVywitGkRbIMJE00x4RZbVGj");

// Create Checkout Session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { service, cost, urgency } = req.body;

    const line_items = [
      {
        price_data: {
          currency: "aud",
          product_data: {
            name: service,
          },
          unit_amount: cost * 100, // Stripe needs cents
        },
        quantity: 1,
      },
    ];

    if (urgency) {
      line_items.push({
        price_data: {
          currency: "aud",
          product_data: {
            name: "Urgency Fee",
          },
          unit_amount: urgency * 100,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: "http://localhost:5173/success", // Change to your success page
      cancel_url: "http://localhost:5173/cancel",   // Change to your cancel page
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(4242, () => console.log("Server running on http://localhost:4242"));
