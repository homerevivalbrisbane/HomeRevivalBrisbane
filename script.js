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
  // Remove the emoji and get the text properly
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
  const basePrice = servicePrices[service] || 30;
  const feeNote = document.getElementById("feeNote");
  const urgentCheckbox = document.querySelector("input[name='urgent']");

  document.getElementById("formTitle").innerText = `Request Help: ${service}`;
  updateFeeNote(basePrice, urgentCheckbox.checked, service);

  document.getElementById("contactForm").classList.remove("hidden");

  // Add hidden input to track service
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
// Get all service buttons
const serviceButtons = document.querySelectorAll('.service');
const contactForm = document.getElementById('contactForm');
const feeNote = document.getElementById('feeNote');
const formTitle = document.getElementById('formTitle');

// Open form modal when a service is clicked
serviceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const serviceName = btn.textContent.split('\n')[1]; // get the service label
        formTitle.textContent = `Request Help - ${serviceName}`;
        contactForm.classList.remove('hidden');

        // Show special fee note only if "Other" is clicked
        if (serviceName.trim() === "Other") {
            feeNote.innerHTML = 'Note: Additional fees may apply. See <a href="terms.html#service-fee" target="_blank">Terms §3</a> for more information.';
        } else {
            feeNote.innerHTML = ''; // clear note for other services
        }
    });
});

// Close form modal
function closeForm() {
    contactForm.classList.add('hidden');
    feeNote.innerHTML = '';
}
