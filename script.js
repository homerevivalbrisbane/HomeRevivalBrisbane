// Prices for each service type
const servicePrices = {
  Plumbing: 50,
  Electrical: 50,
  Painting: 30,
  Gardening: 20,
  Cleaning: 30,
  Appliances: 30,
  Carpentry: 30,
  Plastering: 30,
  Furniture: 30,
  Other: 20
};

// --- Modal open/close logic ---
function openForm(service) {
  // Set form title
  document.getElementById('formTitle').innerText = `Request Help: ${service}`;

  // Set service type in hidden input
  let hidden = document.getElementById('serviceType');
  if (!hidden) {
    hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.name = 'serviceType';
    hidden.id = 'serviceType';
    document.getElementById('serviceRequestForm').appendChild(hidden);
  }
  hidden.value = service;

  // Get price for the service
  const price = servicePrices[service] || 30;

  // Update fee note only (no separate price display)
  const feeNoteEl = document.getElementById('feeNote');
  if (service === 'Other') {
    feeNoteEl.innerHTML = `<strong>Note:</strong> One-time <strong>$20</strong> fee applies (subject to change). If we can’t find help, we’ll refund you.`;
  } else {
    feeNoteEl.innerHTML = `<strong>Note:</strong> One-time <strong>$${price}</strong> fee applies. If we can’t find help, we’ll refund you.`;
  }

  // Show modal
  document.getElementById('contactForm').classList.remove('hidden');
}

function closeForm() {
  document.getElementById('contactForm').classList.add('hidden');
}

function openTermsModal() {
  document.getElementById('termsModal').classList.remove('hidden');
}

function closeTermsModal() {
  document.getElementById('termsModal').classList.add('hidden');
}

// --- Form validation and submission ---
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("serviceRequestForm");
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      let errorFields = [];
      let requiredFields = form.querySelectorAll("[required]");
      requiredFields.forEach((field) => {
        if (
          (field.type === "checkbox" && !field.checked) ||
          (field.type !== "checkbox" && !field.value.trim())
        ) {
          errorFields.push(field);
          field.classList.add("error-field");
        } else {
          field.classList.remove("error-field");
        }
      });

      const errorMsg = document.getElementById("formErrorMsg");
      if (errorFields.length > 0) {
        if (errorMsg) {
          errorMsg.textContent =
            "Please fill in all required fields and accept the Terms & Conditions.";
          errorMsg.style.display = "block";
        }
        return; // stop submission if invalid
      } else {
        if (errorMsg) errorMsg.style.display = "none";
      }

      // Build FormData and submit via fetch (AJAX)
      try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
          method: form.method,
          body: formData,
          headers: {
            'Accept': 'application/json'
          },
        });

        if (response.ok) {
          alert("Thank you! Your request has been sent.");
          form.reset();
          closeForm(); // close modal on success
        } else {
          const data = await response.json();
          if (data && data.errors) {
            errorMsg.textContent = data.errors.map(e => e.message).join(", ");
          } else {
            errorMsg.textContent = "Oops! There was a problem submitting your form.";
          }
          errorMsg.style.display = "block";
        }
      } catch (error) {
        errorMsg.textContent = "Network error. Please try again later.";
        errorMsg.style.display = "block";
      }
    });
  }
});
