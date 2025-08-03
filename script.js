// --- Modal open/close logic ---
function openForm(serviceType) {
  document.getElementById("contactForm").classList.remove("hidden");
  document.getElementById("formTitle").textContent = `Request Help: ${serviceType}`;
  document.getElementById("customFields").innerHTML = generateFields(serviceType);
}

function closeForm() {
  document.getElementById("contactForm").classList.add("hidden");
}

function openTermsModal() {
  document.getElementById("termsModal").classList.remove("hidden");
}

function closeTermsModal() {
  document.getElementById("termsModal").classList.add("hidden");
}



// --- Form validation ---
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
