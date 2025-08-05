    // Prices for each service type
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

    // Cancel order summary modal and return to form
    function cancelOrderSummary() {
      document.getElementById('orderSummaryModal').classList.add('hidden');
      document.getElementById('contactForm').classList.remove('hidden');
      document.getElementById('orderErrorMsg').style.display = 'none';
    }

    document.addEventListener("DOMContentLoaded", function () {
      const form = document.getElementById("serviceRequestForm");

      form.addEventListener("submit", function (e) {
        e.preventDefault();

        const errorMsg = document.getElementById("formErrorMsg");
        errorMsg.style.display = "none";

        // Validate required fields
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

        if (errorFields.length > 0) {
          errorMsg.textContent =
            "Please fill in all required fields and accept the Terms & Conditions.";
          errorMsg.style.display = "block";
          return; // stop submission if invalid
        }

        // Validation passed, show order summary modal

        // Gather form data
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
          data[key] = value;
        });

        // Calculate prices
        const service = data.serviceType;
        const basePrice = servicePrices[service] || 30;
        const urgentFee = form.querySelector('input[name="urgent"]').checked ? 40 : 0;
        const totalPrice = basePrice + urgentFee;

        // Build order summary HTML
        let summaryHTML = `
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone}</p>
          <p><strong>Address:</strong> ${data.address}</p>
          <p><strong>Preferred Completion Date:</strong> ${data.completionDate || 'Not specified'}</p>
          <p><strong>Urgent:</strong> ${urgentFee ? 'Yes (+$40)' : 'No'}</p>
          <p><strong>Budget:</strong> ${data.budget || 'Not specified'}</p>
          <p><strong>Job Description:</strong> ${data.additionalInfo}</p>
          <hr />
          <p><strong>Cost Breakdown:</strong></p>
          <p>Base Service Fee: $${basePrice}</p>
          <p>Urgent Fee: $${urgentFee}</p>
          <p><strong>Total Cost: $${totalPrice}</strong></p>
        `;

        document.getElementById('orderDetails').innerHTML = summaryHTML;

        // Hide main form modal, show order summary modal
        closeForm();
        document.getElementById('orderSummaryModal').classList.remove('hidden');

        // Store formData for submission on confirmation
        window.confirmationFormData = formData;
      });

      // Confirm & proceed button listener
      document.getElementById('confirmPaymentBtn').addEventListener('click', async function () {
        const orderErrorMsg = document.getElementById('orderErrorMsg');
        orderErrorMsg.style.display = 'none';

        // Submit the stored form data via fetch
        try {
          const response = await fetch(form.action, {
            method: form.method,
            body: window.confirmationFormData,
            headers: {
              'Accept': 'application/json'
            },
          });

          if (response.ok) {
            alert("Thank you! Your request has been sent.");
            form.reset();
            document.getElementById('orderSummaryModal').classList.add('hidden');
          } else {
            const data = await response.json();
            if (data && data.errors) {
              orderErrorMsg.textContent = data.errors.map(e => e.message).join(", ");
            } else {
              orderErrorMsg.textContent = "Oops! There was a problem submitting your form.";
            }
            orderErrorMsg.style.display = "block";
          }
        } catch (error) {
          orderErrorMsg.textContent = "Network error. Please try again later.";
          orderErrorMsg.style.display = "block";
        }
      });
    });
