let isFormSubmitted = false;
let isFormDirty = false;
async function handleFormSubmit(formId) {

  const form = document.getElementById(formId);
  if (!form) {
    console.error(`Form with ID ${formId} not found.`);
    return;
  }
  // Detect typing (dirty state)
  form.addEventListener("input", function () {
    const hasValue = Array.from(form.elements).some(
      (el) =>
        el.tagName !== "BUTTON" &&
        el.type !== "hidden" &&
        el.value &&
        el.value.trim() !== ""
    );
    isFormDirty = hasValue;
  });
  form.addEventListener("submit", async function (event) {

    event.preventDefault(); // Prevent the default form submission

    // Show waiting indicator
    Swal.fire({
      title: "Submitting...",
      text: "Please wait while we process your request.",
      icon: "info",
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Gather form data
    const clientName = form.querySelector('[name="clientName"]')?.value.trim() || "";
    const companyName = form.querySelector('[name="companyName"]')?.value.trim() || "";
    const designation = form.querySelector('[name="designation"]')?.value.trim() || "";
    const email = form.querySelector('[name="email"]')?.value.trim() || "";
    const department = form.querySelector('[name="department"]')?.value.trim() || "";
    const phone = form.querySelector('[name="phone"]')?.value.trim() || "";
    const website = form.querySelector('[name="website"]')?.value.trim() || "";
    const city = form.querySelector('[name="City"]')?.value.trim() || "";


    // Validation for missing fields
    let missingFields = [];
    if (!clientName) missingFields.push("clientName");
    if (!companyName) missingFields.push("companyName");
    if (!designation) missingFields.push("designation");
    if (!email) missingFields.push("email");
    if (!department) missingFields.push("department");
    if (!phone) missingFields.push("Phone");
    if (!website) missingFields.push("website");
    if (!city) missingFields.push("City");


    if (missingFields.length > 0) {
      Swal.close(); // Close the waiting indicator
      Swal.fire({
        title: "Missing Fields",
        text: `Please fill out the following fields: ${missingFields.join(
          ", "
        )}`,
        icon: "warning",
        confirmButtonText: "Close",
      });
      return;
    }

    // Validate phone number length
    if (!/^\d{10}$/.test(phone)) {
      Swal.close(); // Close the waiting indicator
      Swal.fire({
        title: "Invalid Phone Number",
        text: "Please enter a valid 10-digit mobile number.",
        icon: "error",
        confirmButtonText: "Close",
      });
      return;
    }

    const payload = {
      page_url: window.location.href,
      project_name: "Aajneeti Agreement Page",
      form_name: clientName,
      form_companyName: companyName,
      form_designation: designation,
      form_email: email,
      form_department: department,
      form_mobile: phone,
      form_website: website,
      form_city: city,
      doc_url: document.URL,
      doc_ref: document.referrer,
    };
    console.log(payload);
    const apiUrl = "https://apiv2.aajneetiadvertising.com/lead/save";

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify(payload),
    };

    try {
      const response = await fetch(apiUrl, requestOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      isFormSubmitted = true;
      const data = await response.json();

      // Redirect

      // ✅ Save data for next page
      localStorage.setItem("formSubmitted", "true");

      localStorage.setItem("policyData", JSON.stringify({
        clientName,
        companyName,
        designation,
        email,
        phone,
        website
      }));

      // ✅ Redirect
      window.location.href = "/agreement.html";

    } catch (error) {
      console.error("Error:", error);

      // Show error popup
      Swal.fire({
        title: "Error",
        text: "There was an error submitting the form. Please try again.",
        icon: "error",
        confirmButtonText: "Close",
      });
    }
  });
}

window.addEventListener("beforeunload", function (e) {
  if (isFormDirty && !isFormSubmitted) {
    e.preventDefault();
    e.returnValue = "";
  }
});

// Initialize forms
handleFormSubmit("ajax-header-contact"); // First form
handleFormSubmit("ajax-header-contact-2"); // second form
