// script.js
// Replace with your Stripe publishable key
const stripe = Stripe("pk_test_YOUR_PUBLIC_KEY"); // <-- REPLACE

// Prices (kept from your original)
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

document.addEventListener("DOMContentLoaded", () => {
  // Attach click handlers to service elements (supports both `.service` and `.service-icon`)
  const serviceElements = Array.from(document.querySelectorAll(".service, .service-icon"));
  serviceElements.forEach(el => {
    el.style.cursor = "pointer";
    el.addEventListener("click", () => {
      const datasetService = el.dataset && el.dataset.service;
      const textService = el.textContent ? el.textContent.trim().split("\n")[0].trim() : "";
      const svc = datasetService || textService;
      openForm(svc);
    });
  });

  // Wire up close buttons / overlays if present
  const closeFormBtn = document.getElementById("closeForm") || document.querySelector("#formOverlay .close-btn") || document.querySelector("#contactForm .close-btn");
  if (closeFormBtn) closeFormBtn.addEventListener("click", () => closeForm());

  // Allow clicking outside modal content to close (if overlay exists)
  const overlayEls = [document.getElementById("formOverlay"), document.getElementById("contactForm")].filter(Boolean);
  overlayEls.forEach(ov => {
    ov.addEventListener("click", (e) => {
      if (e.target === ov) closeForm();
    });
  });

  // Terms modal toggles
  const openTerms = document.getElementById("openTerms");
  const termsModal = document.getElementById("termsModal") || document.getElementById("terms");
  const closeTermsBtn = document.getElementById("closeTerms") || (termsModal && termsModal.querySelector(".close-btn"));
  if (openTerms) openTerms.addEventListener("click", (e) => { e.preventDefault(); showTerms(); });
  if (closeTermsBtn) closeTermsBtn.addEventListener("click", () => hideTerms());
  if (termsModal) {
    termsModal.addEventListener("click", (e) => { if (e.target === termsModal) hideTerms(); });
  }

  // Hook the form submit (supports both IDs)
  const form = document.getElementById("serviceRequestForm") || document.getElementById("serviceForm");
  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  }

  // If an old "pay-now-btn" exists, keep it working (backwards compatibility)
  const payNowBtn = document.getElementById("pay-now-btn");
  if (payNowBtn) {
    payNowBtn.addEventListener("click", async () => {
      const totalEl = document.getElementById("order-total");
      if (!totalEl) return alert("Total not found.");
      const amount = Math.round(parseFloat(totalEl.textContent.replace(/[^0-9.]/g, "")) * 100);
      await createCheckoutAndRedirect(amount);
    });
  }

  // expose openForm globally so inline onclick="openForm('Plumbing')" still works
  window.openForm = openForm;
});

/* ---------- Helper functions ---------- */

function normalizeServiceName(raw) {
  if (!raw) return "Other";
  const s = String(raw).trim();
  if (!s) return "Other";
  const l = s.toLowerCase();
  if (l.includes("plumb")) return "Plumbing";
  if (l.includes("elect")) return "Electrical";
  if (l.includes("paint")) return "Painting";
  if (l.includes("garden") || l.includes("yard")) return "Gardening";
  if (l.includes("clean")) return "Cleaning";
  if (l.includes("appl")) return "Appliances";
  if (l.includes("carp")) return "Carpentry";
  if (l.includes("plaster")) return "Plastering";
  if (l.includes("furn")) return "Furniture";
  if (l.includes("other") || l.includes("?")) return "Other";
  // If it already matches a key, use it
  if (servicePrices[s]) return s;
  // fallback: capitalize first letter
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getBasePrice(service) {
  const svc = normalizeServiceName(service);
  return servicePrices[svc] ?? 30;
}

/* Open the request form for the chosen service */
function openForm(service) {
  const svc = normalizeServiceName(service);
  // Set form title element if present
  const formTitle = document.getElementById("formTitle");
  if (formTitle) formTitle.innerText = `Request Help: ${svc}`;

  // Update fee note (supports id 'feeNote' or class '.fee-note')
  const price = getBasePrice(svc);
  const feeElById = document.getElementById("feeNote");
  const feeElByClass = document.querySelector(".fee-note");
  if (feeElById) feeElById.innerHTML = `<strong>Fee:</strong> $${price}`;
  else if (feeElByClass) feeElByClass.innerHTML = `* A $${price} service fee applies`;

  // Put the service value into a hidden input in whichever form exists
  const form = document.getElementById("serviceRequestForm") || document.getElementById("serviceForm");
  if (form) {
    let hidden = form.querySelector('input[name="serviceType"]');
    if (!hidden) {
      hidden = document.createElement("input");
      hidden.type = "hidden";
      hidden.name = "serviceType";
      form.appendChild(hidden);
    }
    hidden.value = svc;
  }

  // Show overlay/modal (supports both markup variants)
  const contactModal = document.getElementById("contactForm");
  const formOverlay = document.getElementById("formOverlay");
  if (contactModal) {
    contactModal.classList.remove("hidden");
    contactModal.style.display = "flex";
  } else if (formOverlay) {
    formOverlay.style.display = "flex";
  } else {
    // If no overlay present, try to open a modal-style form container
    const inlineForm = document.querySelector("form");
    if (inlineForm) inlineForm.scrollIntoView({ behavior: "smooth" });
  }

  // Focus the first input / textarea if present
  setTimeout(() => {
    const firstInput = (form && (form.querySelector("input:not([type=hidden]), textarea, select"))) || document.querySelector("input:not([type=hidden]), textarea, select");
    if (firstInput) firstInput.focus();
  }, 120);
}

/* Close the form overlay */
function closeForm() {
  const contactModal = document.getElementById("contactForm");
  const formOverlay = document.getElementById("formOverlay");
  if (contactModal) {
    contactModal.classList.add("hidden");
    contactModal.style.display = "none";
  }
  if (formOverlay) formOverlay.style.display = "none";

  // Also hide any dynamic order summary if open
  const orderModal = document.getElementById("orderSummaryModal");
  if (orderModal) orderModal.style.display = "none";
}

/* Show Terms & Conditions modal */
function showTerms() {
  const termsModal = document.getElementById("termsModal") || document.getElementById("terms");
  if (termsModal) termsModal.style.display = "flex";
  else window.location.href = "terms.html";
}
function hideTerms() {
  const termsModal = document.getElementById("termsModal") || document.getElementById("terms");
  if (termsModal) termsModal.style.display = "none";
}

/* Handle submits from whichever form is present */
function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);

  // Extract service name from form hidden or field
  let service = fd.get("serviceType") || (document.getElementById("serviceType") && document.getElementById("serviceType").value) || form.dataset?.service || "";
  service = normalizeServiceName(service);

  // Determine urgent fee either from checkbox ("urgent") or select ("timing")
  let urgentFee = 0;
  if (fd.get("urgent")) urgentFee = 40;
  const timing = fd.get("timing");
  if (timing && timing.toLowerCase() === "urgent") urgentFee = 40;

  const basePrice = getBasePrice(service);
  const total = basePrice + urgentFee;

  // Collate order details to show on summary
  const order = {
    service,
    basePrice,
    urgentFee,
    total,
    formData: Object.fromEntries(fd.entries())
  };

  // If older modal markup exists, re-use it; otherwise create a small summary modal
  showOrderSummary(order);

  // Hide the form overlay
  const contactModal = document.getElementById("contactForm");
  const formOverlay = document.getElementById("formOverlay");
  if (contactModal) {
    contactModal.classList.add("hidden");
    contactModal.style.display = "none";
  }
  if (formOverlay) formOverlay.style.display = "none";
}

/* Show or create an order summary modal and wire confirm button */
function showOrderSummary(order) {
  let modal = document.getElementById("orderSummaryModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "orderSummaryModal";
    modal.className = "modal";
    modal.style.display = "none";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(0,0,0,0.6)";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.zIndex = "2000";

    modal.innerHTML = `
      <div class="modal-content" style="background:#fff; padding:20px; border-radius:10px; width:90%; max-width:520px; max-height:90%; overflow:auto; position:relative;">
        <span class="close-btn" id="cancelOrderSummaryBtn" style="position:absolute; right:12px; top:8px; cursor:pointer; font-size:22px;">&times;</span>
        <h2>Confirm Your Request</h2>
        <div id="orderDetails" style="margin-top:12px;"></div>
        <div style="margin-top:18px; display:flex; gap:10px; justify-content:flex-end;">
          <button id="confirmPaymentBtn" class="cta-btn" style="background:#2c5f2d; color:#fff; padding:10px 14px; border-radius:8px;">Confirm & Proceed</button>
          <button id="cancelOrderBtn" class="secondary-btn" style="background:#f3f3f3; color:#222; padding:10px 12px; border-radius:8px;">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Close handlers
    document.getElementById("cancelOrderSummaryBtn").addEventListener("click", () => {
      modal.style.display = "none";
      // Open the form again so user can adjust
      const formOverlay = document.getElementById("formOverlay");
      const contactModal = document.getElementById("contactForm");
      if (contactModal) { contactModal.classList.remove("hidden"); contactModal.style.display = "flex"; }
      else if (formOverlay) formOverlay.style.display = "flex";
    });
    document.getElementById("cancelOrderBtn").addEventListener("click", () => {
      modal.style.display = "none";
      const formOverlay = document.getElementById("formOverlay");
      const contactModal = document.getElementById("contactForm");
      if (contactModal) { contactModal.classList.remove("hidden"); contactModal.style.display = "flex"; }
      else if (formOverlay) formOverlay.style.display = "flex";
    });
  }

  const orderDetails = modal.querySelector("#orderDetails");
  orderDetails.innerHTML = `
    <p><strong>Service:</strong> ${escapeHtml(order.service)}</p>
    <p><strong>Base price:</strong> $${Number(order.basePrice).toFixed(2)}</p>
    <p><strong>Urgent fee:</strong> $${Number(order.urgentFee).toFixed(2)}</p>
    <p style="margin-top:8px;"><strong>Total:</strong> $${Number(order.total).toFixed(2)}</p>
  `;

  // show modal
  modal.style.display = "flex";

  // attach confirm handler
  const confirmBtn = document.getElementById("confirmPaymentBtn");
  confirmBtn.onclick = async () => {
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Processing...";
    try {
      await createCheckoutAndRedirect(Math.round(Number(order.total) * 100), order);
    } catch (err) {
      console.error(err);
      alert("Could not create payment session. See console.");
      confirmBtn.disabled = false;
      confirmBtn.textContent = "Confirm & Proceed";
    }
  };
}

/* Create a checkout session on your backend and redirect */
async function createCheckoutAndRedirect(amountInCents, order = {}) {
  // Replace with your backend endpoint — the original used Netlify function
  // This must return JSON { url: "https://checkout.stripe.com/..." }
  const endpoint = "/.netlify/functions/create-checkout-session";

  const payload = {
    amount: amountInCents,
    metadata: {
      service: order.service || "",
      basePrice: order.basePrice || "",
      urgentFee: order.urgentFee || ""
    }
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error("Payment session creation failed: " + txt);
  }

  const data = await res.json();
  if (data.url) {
    window.location.href = data.url;
    return;
  }
  throw new Error("No redirect URL returned from backend.");
}

/* Small utility to avoid XSS in inserted strings */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
