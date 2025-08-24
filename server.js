
app.listen(3000, () => console.log("Server running on port 3000"));
import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';

const app = express();
const stripe = new Stripe('spk_test_51RzXEUS9s8DViJRGJX6FLVQ7CqIj6HpoxE5vJHBWpRCvbeiGg9vc1LNw5P4QsLHSHqiceXF4IKmilLPqZ3DwEeUT009beNjoxF', {
  apiVersion: '2022-11-15'
});

app.use(cors());
app.use(express.json());

// Create payment intent
app.post('/create-payment-intent', async (req, res) => {
  const { service, urgent } = req.body;
  let amount = 0;

  // Set prices for each service
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

  amount = servicePrices[service] || 100;
  if (urgent) amount += 40; // urgency fee

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // in cents
      currency: 'aud',
      automatic_payment_methods: { enabled: true }
    });
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// Log order (optional)
app.post('/log-order', (req, res) => {
  console.log("Order received:", req.body);
  res.send({ success: true });
});

app.listen(3000, () => console.log("Server running on port 3000"));

