import { loadStripe } from "@stripe/stripe-js";
const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

async function initialize() {
  const fetchClientSecret = async () => {
    // Get priceId from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const priceId = urlParams.get('priceId');

    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Pass priceId to our server
      body: JSON.stringify({ priceId }),
    });
    const { clientSecret } = await response.json();
    return clientSecret;
  };

  const checkout = await stripe.initEmbeddedCheckout({
    fetchClientSecret,
  });

  // Mount Checkout
  checkout.mount('#checkout');
}

initialize();

