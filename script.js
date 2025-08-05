function openForm(serviceName) {
  document.getElementById("formOverlay").style.display = "flex";
  document.getElementById("serviceType").value = serviceName;
}

// Form submission
document.getElementById("serviceForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const form = e.target;
  const service = form.serviceType.value;
  const urgency = form.urgency.value;

  let basePrice = 0;
  let urgencyCharge = 0;

  if (["Electrical", "Plumbing", "Carpentry"].includes(service)) {
    basePrice = 50;
  } else {
    basePrice = 30;
  }

  if (urgency === "urgent") {
    urgencyCharge = 40;
  }

  const total = basePrice + urgencyCharge;

  document.getElementById("formOverlay").style.display = "none";
  document.getElementById("summaryService").textContent = `${service} - $${basePrice}`;
  document.getElementById("summaryUrgency").textContent = `$${urgencyCharge}`;
  document.getElementById("summaryTotal").textContent = `$${total}`;

  document.getElementById("billingSummary").style.display = "flex";

  // Store form data for later (like for Stripe)
  window.formData = {
    name: form.name.value,
    contact: form.contact.value,
    address: form.address.value,
    service,
    urgency,
    description: form.description.value,
    price: total
  };
});

// Finalise payment (in future: redirect to Stripe)
document.getElementById("finalisePayment").addEventListener("click", function () {
  const data = window.formData;

  alert(`Redirecting to payment for ${data.service} ($${data.price})`);

  // Later: send this to backend to create Stripe Checkout session
  // window.location.href = "https://your-stripe-checkout-url";
});
