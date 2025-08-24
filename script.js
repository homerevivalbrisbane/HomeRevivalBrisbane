// ------------------------------
// Stripe Setup
// ------------------------------
const stripe = Stripe("pk_test_YOUR_PUBLIC_KEY"); // <-- Replace with your key
let elements;

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
// On DOM Ready
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Animate on scroll
  const animatedElements = document.querySelectorAll(".fade-up, .fade-left, .fade-right");
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 }
  );
  animatedElements.forEach(el => observer.observe(el));

  // Make service icons clickable
  const serviceElements = document.querySelectorAll(".service, .service-card, .service-icon");
  serviceElements.forEach(el => {
    el.style.cursor = "pointer";
    el.addEventListener("click", () => {
      const datasetService = el.dataset?.service;
      const textService = el.textContent?.trim().split("\n")[0].trim();
      const svc = datasetService || textService;
      openForm(svc);
    });
  });

  // Form submit
  const form = document.getElementById("serviceRequestForm");
  if (form) form.addEventListener("submit", handleFormSubmit);

  // Order confirm
  const confirmBtn = document.getElementById("confirmPaymentBtn");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", async () => {
      document.getElementById("orderSummaryModal").classList.add("hidden");
      document.getElementById("paymentModal").classList.remove("hidden");
    });
  }

  // Payment submission
  const submitPaymentBtn = document.getElementById("submitPaymentBtn");
  if (submitPaymentBtn) {
    submitPaymentBtn.addEventListener("click", async () => {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href }
      });
      if (error) {
        document.getElementById("paymentMessage").textContent = error.message;
      }
    });
  }

  // Smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId.length > 1) {
        e.preventDefault();
        document.querySelector(targetId).scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Expose openForm globally
  window.openForm = openForm;
  window.closeForm = closeForm;
  window.cancelOrderSummary = cancelOrderSummary;
  window.cancelPayment = cancelPayment;
});

// ------------------------------
// Modal + Form Flow
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
}

// ------------------------------
// Handle Form Submit
// ------------------------------
function handleFormSubmit(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const service = formData.get("serviceType");
  const basePrice = servicePrices[service] || 30;
  const urgentFee = formData.get("urgent") ? 40 : 0;
  const total = basePrice + urgentFee;

  document.getElementById("orderDetails").innerHTML = `
    <p><strong>Service:</strong> ${service}</p>
    <p><strong>Base price:</strong> $${basePrice}</p>
    <p><strong>Urgent fee:</strong> $${urgentFee}</p>
    <p><strong>Total:</strong> $${total}</p>
  `;

  closeForm();
  document.getElementById("orderSummaryModal").classList.remove("hidden");

  // create payment intent
  setupStripe(total);
}

// ------------------------------
// Stripe Payment Setup
// ------------------------------
async function setupStripe(total) {
  const amount = total * 100; // cents
  const res = await fetch("/.netlify/functions/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount })
  });
  const data = await res.json();

  if (data.clientSecret) {
    elements = stripe.elements({ clientSecret: data.clientSecret });
    const paymentElement = elements.create("payment");
    paymentElement.mount("#payment-element");
  } else if (data.url) {
    // fallback to Checkout redirect
    window.location.href = data.url;
  }
}
