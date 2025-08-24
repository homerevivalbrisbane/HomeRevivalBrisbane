// server.js
import express from "express";
import Stripe from "stripe";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const stripe = new Stripe("sk_test_51RzXEUS9s8DViJRGf8CPh2myvwvyMKEr2Tf63Ow3aCYMK62JGvoaE5n9aFrD6pUU7kkShxiBqRnVywitGkRbIMJE00x4RZbVGj");

// Route to create checkout session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { serviceCost, urgencyFee } = req.body;

    // calculate total
    const totalAmount = (serviceCost + (urgencyFee || 0)) * 100; // in cents

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "aud",
            product_data: {
              name: "Home Revival Brisbane - Service",
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      success_url: "http://localhost:5173/success", // change to your domain
      cancel_url: "http://localhost:5173/cancel",
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(4242, () => console.log("Server running on http://localhost:4242"));
