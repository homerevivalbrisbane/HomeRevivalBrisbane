document.getElementById("serviceForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const service = formData.get("serviceType");
  const urgency = formData.get("urgency");

  let basePrice = 0;
  let urgencyPrice = 0;

  // Set base price
  switch (service) {
    case "Plumbing":
    case "Electrical":
    case "Carpentry":
      basePrice = 50;
      break;
    case "Cleaning":
    case "Gardening":
    case "Pest Control":
      basePrice = 30;
      break;
    case "Other":
      basePrice = 20; // placeholder, no payment
      break;
  }

  // Urgency charge
  if (urgency === "urgent" && service !== "Other") {
    urgencyPrice = 40;
  }

  const totalPrice = basePrice + urgencyPrice;

  // Save form data globally
  window.currentFormData = {
    service,
    urgency,
    basePrice,
    urgencyPrice,
    totalPrice,
    name: formData.get("name"),
    address: formData.get("address"),
    contact: formData.get("contact"),
    description: formData.get("description"),
  };

  // Show billing summary
  document.getElementById("summaryService").textContent = `${service} - $${basePrice}`;
  document.getElementById("summaryUrgency").textContent = urgency === "urgent" ? `$${urgencyPrice}` : "$0";
  document.getElementById("summaryTotal").textContent = `$${totalPrice}`;

  document.getElementById("billingSummaryModal").classList.add("active");
});

// Finalise and redirect to Stripe
document.getElementById("proceedToPayment").addEventListener("click", async () => {
  const data = window.currentFormData;
  document.getElementById("billingSummaryModal").classList.remove("active");

  // Send data to server to create checkout session
  const response = await fetch("/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (result.url) {
    window.location.href = result.url;
  } else {
    alert("Stripe payment failed to start.");
  }
});
