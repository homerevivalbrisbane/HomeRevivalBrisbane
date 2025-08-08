const stripe = Stripe("pk_test_YOUR_PUBLIC_KEY"); // Replace with your Stripe publishable key
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

function openForm(service) {
  document.getElementById('formTitle').innerText = `Request Help: ${service}`;
  const price = servicePrices[service] || 30;
  document.getElementById('feeNote').innerHTML = `<strong>Fee:</strong> $${price}`;
  document.getElementById('contactForm').classList.remove('hidden');
  const hidden = document.createElement('input');
  hidden.type = 'hidden';
  hidden.name = 'serviceType';
  hidden.value = service;
  document.getElementById('serviceRequestForm').appendChild(hidden);
}

function closeForm() {
  document.getElementById('contactForm').classList.add('hidden');
}

function cancelOrderSummary() {
  document.getElementById('orderSummaryModal').classList.add('hidden');
  document.getElementById('contactForm').classList.remove('hidden');
}

function cancelPayment() {
  document.getElementById('paymentModal').classList.add('hidden');
}

document.getElementById("serviceRequestForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const service = formData.get("serviceType");
  const basePrice = servicePrices[service] || 30;
  const urgentFee = formData.get("urgent") ? 40 : 0;
  const total = basePrice + urgentFee;

  document.getElementById("orderDetails").innerHTML = `
    <p>Service: ${service}</p>
    <p>Total: $${total}</p>
  `;

  closeForm();
  document.getElementById('orderSummaryModal').classList.remove('hidden');
});

document.getElementById("confirmPaymentBtn").addEventListener("click", async function () {
  document.getElementById('orderSummaryModal').classList.add('hidden');
  document.getElementById('paymentModal').classList.remove('hidden');

  const { clientSecret } = await fetch("/create-payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: 5000 }) // example $50
  }).then(r => r.json());

  elements = stripe.elements({ clientSecret });
  const paymentElement = elements.create("payment");
  paymentElement.mount("#payment-element");
});

document.getElementById("submitPaymentBtn").addEventListener("click", async function () {
  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: { return_url: window.location.href }
  });
  if (error) {
    document.getElementById("paymentMessage").textContent = error.message;
  }
});
