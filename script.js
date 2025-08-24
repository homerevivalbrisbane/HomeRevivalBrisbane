// ------------------------------
// Stripe Setup
// ------------------------------
const stripe = Stripe("pk_test_YOUR_PUBLIC_KEY"); // <-- Replace with your key
let elements, paymentElement;

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

// ------------------------------
// DOM Ready
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Animate on scroll
  const animatedElements = document.querySelectorAll("[data-aos]");
  animatedElements.forEach(el => AOS.init({ duration: 700, once: true }));

  // Add data-service attribute for clarity
  document.querySelectorAll(".service").forEach(el => {
    const serviceName = el.textContent.split("\n")[1]?.trim() || el.textContent.trim();
    el.dataset.service = serviceName;
    el.addEventListener("click", () => openForm(serviceName));
  });

  // Form submit
  document.getElementById("serviceRequestForm").addEventListener("submit", handleFormSubmit);

  // Confirm order
  document.getElementById("confirmPaymentBtn").addEventListener("click", () => {
    document.getElementById("orderSummaryModal").classList.add("hidden");
    document.getElementById("paymentModal").classList.remove("hidden");
  });

  // Stripe payment
  document.getElementById("submitPaymentBtn").addEventListener("click", async () => {
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href }
    });
    if (error) document.getElementById("paymentMessage").textContent = error.message;
  });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", e => {
      const targetId = anchor.getAttribute("href");
      if (targetId.length > 1) {
        e.preventDefault();
        document.querySelector(targetId).scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Expose globally
  window.openForm = openForm;
  window.closeForm = closeForm;
  window.cancelOrderSummary = cancelOrderSummary;
  window.cancelPayment = cancelPayment;
});

// ------------------------------
// Open / Close Modals
// ------------------------------
function openForm(service) {
  const price = servicePrices[service] || 30;
  document.getElementById("formTitle").innerText = `Request Help: ${service}`;
  document.getElementById("feeNote").innerHTML = `<strong>Fee:</strong> $${price}`;
  document.getElementById("contactForm").classList.remove("hidden");

  let hidden = document.querySelector("input[name='serviceType']");
  if (!hidden) {
    hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.name = "serviceType";
    document.getElementById("serviceRequestForm").appendChild(hidden);
  }
  hidden.value = service;
}

function closeForm() {
  document.getElementById("contactForm").classList.add("hidden");
}

function cancelOrderSummary() {
  document.getElementById("orderSummaryModal").classList.add("hidden");
  document.getElementById("contactForm").classList.remove("hidden");
}

function cancelPayment() {
  document.getElementById("paymentModal").classList.add("hidden");
  if (paymentElement) paymentElement.unmount();
}

// ------------------------------
// Handle Form Submit
// ------------------------------
async function handleFormSubmit(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const service = formData.get("serviceType");
  const basePrice = servicePrices[service] || 30;
  const urgentFee = formData.get("urgent") === "on" ? 40 : 0;
  const total = basePrice + urgentFee;

  document.getElementById("orderDetails").innerHTML = `
    <p><strong>Service:</strong> ${service}</p>
    <p><strong>Base price:</strong> $${basePrice}</p>
    <p><strong>Urgent fee:</strong> $${urgentFee}</p>
    <p><strong>Total:</strong> $${total}</p>
  `;

  closeForm();
  document.getElementById("orderSummaryModal").classList.remove("hidden");

  await setupStripe(total);
}

// ------------------------------
// Stripe Payment Setup
// ------------------------------
async function setupStripe(total) {
  const amount = total * 100; // convert to cents
  try {
    const res = await fetch("/.netlify/functions/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount })
    });
    const data = await res.json();

    if (data.clientSecret) {
      elements = stripe.elements({ clientSecret: data.clientSecret });
      if (paymentElement) paymentElement.unmount();
      paymentElement = elements.create("payment");
      paymentElement.mount("#payment-element");
    } else if (data.url) {
      window.location.href = data.url;
    }
  } catch (err) {
    console.error("Stripe setup error:", err);
  }
}
