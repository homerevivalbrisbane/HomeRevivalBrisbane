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

// --- Custom dynamic fields per service ---
function generateFields(service) {
  switch (service) {
    case "Plumbing":
      return `
        <label>What’s the plumbing issue?</label>
        <textarea required></textarea>
        <label>Do you need emergency assistance?</label>
        <select required><option value="">Select</option><option>No</option><option>Yes</option></select>
      `;
    case "Electrical":
      return `
        <label>What’s the electrical issue?</label>
        <textarea required></textarea>
        <label>Is this a safety hazard?</label>
        <select required><option value="">Select</option><option>No</option><option>Yes</option></select>
      `;
    case "Painting":
      return `
        <label>What do you need painted?</label>
        <input type="text" required />
        <label>Approximate area (m²):</label>
        <input type="number" />
      `;
    case "Gardening":
      return `
        <label>Lawn size:</label>
        <select required><option value="">Select</option><option>Small</option><option>Medium</option><option>Large</option></select>
        <label>Include edging or trimming?</label>
        <select><option>No</option><option>Yes</option></select>
      `;
    case "Cleaning":
      return `
        <label>Cleaning type (e.g. home, end-of-lease):</label>
        <input type="text" required />
        <label>Rooms to clean (e.g. 3 bed, 2 bath):</label>
        <input type="text" />
      `;
    case "Appliances":
      return `
        <label>What appliance is it?</label>
        <input type="text" required />
        <label>Describe the problem:</label>
        <textarea required></textarea>
      `;
    case "Furniture":
      return `
        <label>What furniture needs attention?</label>
        <input type="text" required />
        <label>Assembly or repair?</label>
        <select required><option value="">Select</option><option>Assembly</option><option>Repair</option></select>
      `;
    case "Other":
    default:
      return `
        <label>Describe your issue:</label>
        <textarea required></textarea>
        <label>What kind of help are you looking for?</label>
        <input type="text" />
      `;
  }
}

// --- Form validation ---
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("serviceRequestForm");
  if (form) {
    form.addEventListener("submit", function (e) {
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
        e.preventDefault();
        if (errorMsg) {
          errorMsg.textContent =
            "Please fill in all required fields and accept the Terms & Conditions.";
          errorMsg.style.display = "block";
        }
      } else {
        if (errorMsg) errorMsg.style.display = "none";
      }
    });
  }
});
