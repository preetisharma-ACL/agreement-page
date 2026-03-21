let isFormSubmitted = false;
let isFormDirty = false;

function showCustomAlert() {
  const alertBox = document.getElementById("customAlert");
  if (alertBox) alertBox.style.display = "flex";
}

window.closeAlert = function () {
  const alertBox = document.getElementById("customAlert");
  if (alertBox) alertBox.style.display = "none";
};
// ================= LANDING FORM =================
function handleLandingForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

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

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const clientName = form.querySelector('[name="clientName"]')?.value.trim() || "";
    const companyName = form.querySelector('[name="companyName"]')?.value.trim() || "";
    const designation = form.querySelector('[name="designation"]')?.value.trim() || "";
    const email = form.querySelector('[name="email"]')?.value.trim() || "";
    const department = form.querySelector('[name="department"]')?.value.trim() || "";
    const phone = form.querySelector('[name="phone"]')?.value.trim() || "";
    const website = form.querySelector('[name="website"]')?.value.trim() || "";
    const city = form.querySelector('[name="City"]')?.value.trim() || "";

    if (!clientName || !companyName || !designation || !email || !department || !phone || !website || !city) {
      alert("Please fill all fields");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      alert("Invalid phone number");
      return;
    }
    // 🔥 UNIQUE ID GENERATE
    const uniqueId = "AGR-" + Date.now();

    // store for next page
    localStorage.setItem("agreementId", uniqueId);

    localStorage.setItem("formSubmitted", "true");

    localStorage.setItem("policyData", JSON.stringify({
      clientName,
      companyName,
      designation,
      email,
      phone,
      website,
      city
    }));

    isFormSubmitted = true;

    window.location.href = "/agreement";
  });
}

// ================= AGREEMENT PAGE =================
function handleAgreementPage() {

  const data = JSON.parse(localStorage.getItem("policyData"));

  // if (!data) {
  //   window.location.href = "/";
  //   return;
  // }

  const setText = (className, value) => {
    document.querySelectorAll("." + className).forEach(el => {
      el.textContent = value || "";
    });
  };

  setText("clientName", data.clientName);
  setText("companyName", data.companyName);
  setText("designation", data.designation);
  setText("email", data.email);
  setText("phone", data.phone);
  setText("website", data.website);

  const checkbox = document.getElementById("agreeCheck");
  const btn = document.getElementById("aggreeBtn");

  if (!checkbox || !btn) return;

  btn.addEventListener("click", async () => {

    if (btn.disabled) return;

    if (!checkbox.checked) {
      showCustomAlert();
      return;
    }

    btn.innerText = "Submitting...";
    btn.disabled = true;

    try {
      const agreementId = localStorage.getItem("agreementId");

      if (!agreementId) {
        alert("Session expired. Please refill the form.");
        window.location.href = "/";
        return;
      }

      // 🔥 CREATE SHAREABLE LINK
      const agreementLink = window.location.origin + "/agreement-view.html?id=" + agreementId;
      const payload = {

        page_url: window.location.href,
        project_name: "Aajneeti Agreement Page",

        form_name: data.clientName,
        form_companyName: data.companyName,
        form_designation: data.designation,
        form_email: data.email,
        form_mobile: data.phone,
        form_website: data.website,
        form_city: data.city,

        // 🔥 NEW FIELDS
        agreement_id: agreementId,
        agreement_link: agreementLink,
        agreement_accepted: true,
        agreement_timestamp: new Date().toISOString()
      };

      const response = await fetch("https://apiv2.aajneetiadvertising.com/lead/save", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("API failed");
      console.log(agreementLink);
      localStorage.removeItem("policyData");
      localStorage.removeItem("formSubmitted");

      window.location.href = "/thankyou.html";

    } catch (error) {
      console.error(error);

      alert("Something went wrong");

      btn.disabled = false;
      btn.innerText = "I Agree & Submit";
    }

  });
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {

  if (window.location.pathname.includes("agreement")) {
    handleAgreementPage();
  } else {
    handleLandingForm("ajax-header-contact");
    handleLandingForm("ajax-header-contact-2");
  }

});

// ================= EXIT WARNING =================
window.addEventListener("beforeunload", function (e) {
  if (isFormDirty && !isFormSubmitted) {
    e.preventDefault();
    e.returnValue = "";
  }
});