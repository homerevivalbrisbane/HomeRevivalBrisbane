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
  AOS.init({ duration: 700, once: true });

  // Attach service click handlers
  document.querySelectorAll(".service").forEach(el => {
    const serviceName = el.textContent.replace(/[\u{1F300}-\u{1FAFF}]/gu, '').trim();
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

  // Smooth scroll for anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", e => {
      const targetId = anchor.getAttribute("href");
      if (targetId.length > 1) {
        e.preventDefault();
        document.querySelector(targetId).scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Expose functions globally
  window.openForm = openForm;
  window.closeForm = closeForm;
  window.cancelOrderSummary = cancelOrderSummary;
  window.cancelPayment = cancelPayment;
});

// ------------------------------
// Open / Close Modals
// ------------------------------
function openForm(service) {
  const basePrice = servicePrices[service] || 30;
  const feeNote = document.getElementById("feeNote");
  const urgentCheckbox = document.querySelector("input[name='urgent']");

  document.getElementById("formTitle").innerText = `Request Help: ${service}`;
  updateFeeNote(basePrice, urgentCheckbox.checked, service);

  document.getElementById("contactForm").classList.remove("hidden");

  // Hidden input to track service
  let hidden = document.querySelector("input[name='serviceType']");
  if (!hidden) {
    hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.name = "serviceType";
    document.getElementById("serviceRequestForm").appendChild(hidden);
  }
  hidden.value = service;

  // Update fee dynamically when urgent is checked/unchecked
  urgentCheckbox.onchange = () => updateFeeNote(basePrice, urgentCheckbox.checked, service);
}

function updateFeeNote(basePrice, isUrgent, service) {
  let urgentFee = isUrgent ? 40 : 0;
  let note = `<strong>Fee:</strong> $${basePrice + urgentFee}`;
  if (service === "Other") {
    note += `<br><em>Note: 'Other' services may incur additional costs based on complexity.</em>`;
  }
  document.getElementById("feeNote").innerHTML = note;
}

function closeForm() {
  document.getElementById("contactForm").classList.add("hidden");
  const urgentCheckbox = document.querySelector("input[name='urgent']");
  if (urgentCheckbox) urgentCheckbox.checked = false;
  document.getElementById("feeNote").innerHTML = '';
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
const stripe = Stripe("pk_test_YOUR_PUBLIC_KEY"); // Replace with your public key
let elements;
let clientSecret;

// Service selection
document.querySelectorAll(".service").forEach(serviceEl => {
  serviceEl.addEventListener("click", () => {
    document.querySelector("#serviceRequestForm [name='service']")?.remove();
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "service";
    input.value = serviceEl.dataset.service;
    document.getElementById("serviceRequestForm").appendChild(input);
    document.getElementById("contactForm").classList.remove("hidden");
    document.getElementById("formTitle").textContent = `Request Help: ${serviceEl.dataset.service}`;
  });
});

// Close / cancel modals
function closeForm() { document.getElementById("contactForm").classList.add("hidden"); }
function cancelOrderSummary() { document.getElementById("orderSummaryModal").classList.add("hidden"); }
function cancelPayment() { document.getElementById("paymentModal").classList.add("hidden"); }

// Handle form submission -> show order summary
document.getElementById("serviceRequestForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const service = formData.get("service") || "Other";
  const urgent = formData.get("urgent") ? true : false;
  const serviceCost = 0; // actual price will come from backend
  const urgencyFee = urgent ? 40 : 0;

  document.getElementById("orderDetails").innerHTML = `
    <p><strong>Service:</strong> ${service}</p>
    <p><strong>Urgency Fee:</strong> $${urgencyFee}</p>
    <p><strong>Total:</strong> Calculated at payment</p>
  `;

  document.getElementById("orderSummaryModal").classList.remove("hidden");
});

// Confirm & proceed -> create Stripe PaymentIntent and show payment modal
document.getElementById("confirmPaymentBtn").addEventListener("click", async () => {
  const formData = new FormData(document.getElementById("serviceRequestForm"));
  const service = formData.get("service") || "Other";
  const urgent = formData.get("urgent") ? true : false;

  // Request payment intent from backend
  const res = await fetch("http://localhost:3000/create-payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ service, urgent })
  });
  const data = await res.json();
  clientSecret = data.clientSecret;

  document.getElementById("orderSummaryModal").classList.add("hidden");
  document.getElementById("paymentModal").classList.remove("hidden");

  // Mount Stripe Elements if not already mounted
  if (!elements) {
    elements = stripe.elements();
    const paymentElement = elements.create("payment");
    paymentElement.mount("#payment-element");
  }
});

// Handle Stripe payment
document.getElementById("submitPaymentBtn").addEventListener("click", async () => {
  const { error, paymentIntent } = await stripe.confirmPayment({
    elements,
    confirmParams: { return_url: window.location.href },
    redirect: 'if_required'
  });

  if (error) {
    document.getElementById("paymentMessage").textContent = error.message;
    return;
  }

  document.getElementById("paymentMessage").textContent = "Payment successful! ✅";

  // Log order to backend
  const formData = new FormData(document.getElementById("serviceRequestForm"));
  const orderData = Object.fromEntries(formData.entries());
  orderData.paymentId = paymentIntent.id;
  orderData.amount = paymentIntent.amount / 100;

  await fetch("http://localhost:3000/log-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData)
  });

  document.getElementById("paymentModal").classList.add("hidden");
});

