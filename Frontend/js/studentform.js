// js/studentform.js

// Utility to show and clear error messages
function showError(id, message) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = message;
  }
}

function clearError(id) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = "";
  }
}

// Helper to get trimmed value
function v(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

/* ---------------------------------------
   MAIN FIELD VALIDATION (one field only)
----------------------------------------*/
function validateField(field) {
  if (!field || !field.id) return true;
  const id = field.id;
  const value = v(id);
  let ok = true;

  switch (id) {
    case "first_name":
      if (!value) {
        showError("first_name_error", "First name is required.");
        ok = false;
      } else if (!/^[a-zA-Z\s]+$/.test(value)) {
        showError(
          "first_name_error",
          "First name can only contain letters and spaces."
        );
        ok = false;
      } else clearError("first_name_error");
      break;

    case "last_name":
      if (!value) {
        showError("last_name_error", "Last name is required.");
        ok = false;
      } else if (!/^[a-zA-Z\s]+$/.test(value)) {
        showError(
          "last_name_error",
          "Last name can only contain letters and spaces."
        );
        ok = false;
      } else clearError("last_name_error");
      break;

    case "dob":
      if (!value) {
        showError("dob_error", "Date of birth is required.");
        ok = false;
      } else {
        const today = new Date();
        const birthDate = new Date(value);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (isNaN(age)) {
          showError("dob_error", "Enter a valid date of birth.");
          ok = false;
        } else if (age < 18) {
          showError("dob_error", "You must be at least 18 years old.");
          ok = false;
        } else clearError("dob_error");
      }
      break;

    case "contact_no":
      if (!/^[0-9]{10}$/.test(value)) {
        showError(
          "contact_no_error",
          "Enter a valid 10-digit contact number."
        );
        ok = false;
      } else clearError("contact_no_error");
      break;

    case "email":
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        showError("email_error", "Enter a valid email address.");
        ok = false;
      } else clearError("email_error");
      break;

    case "address":
      if (!value) {
        showError("address_error", "Address is required.");
        ok = false;
      } else clearError("address_error");
      break;

          case "ssc_school":
      if (!value) {
        showError("ssc_school_error", "School name is required.");
        ok = false;
      } else clearError("ssc_school_error");
      break;

          case "hsc_school":
      if (!value) {
        showError("hsc_school_error", "School name is required.");
        ok = false;
      } else clearError("hsc_school_error");
      break;


    case "ssc_board":
      if (!value) {
        showError("ssc_board_error", "Please select SSC board.");
        ok = false;
      } else clearError("ssc_board_error");
      break;

    case "ssc_percentage":
      const ssc = parseFloat(value);
      if (!value || isNaN(ssc) || ssc < 0 || ssc > 100) {
        showError(
          "ssc_percentage_error",
          "Enter SSC percentage between 0 and 100."
        );
        ok = false;
      } else clearError("ssc_percentage_error");
      break;

    case "hsc_board":
      if (!value) {
        showError("hsc_board_error", "Please select HSC board.");
        ok = false;
      } else clearError("hsc_board_error");
      break;

    case "hsc_percentage":
      const hsc = parseFloat(value);
      if (!value || isNaN(hsc) || hsc < 0 || hsc > 100) {
        showError(
          "hsc_percentage_error",
          "Enter HSC percentage between 0 and 100."
        );
        ok = false;
      } else clearError("hsc_percentage_error");
      break;
  }

  return ok;
}

/* -------------------------------------------------
   LIVE VALIDATION — via event delegation
   Works even when form is loaded later (routing)
--------------------------------------------------*/

// When a field inside #student-form loses focus → validate it
document.addEventListener(
  "blur",
  function (e) {
    const target = e.target;
    const form = document.getElementById("student-form");
    if (!form) return;

    // Only handle inputs/selects/textareas that are inside the form
    if (
      form.contains(target) &&
      (target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.tagName === "TEXTAREA")
    ) {
      validateField(target);
    }
  },
  true // use capture so blur always fires
);

// While typing, re-validate to clear error as soon as it becomes valid
document.addEventListener("input", function (e) {
  const target = e.target;
  const form = document.getElementById("student-form");
  if (!form) return;

  if (
    form.contains(target) &&
    (target.tagName === "INPUT" ||
      target.tagName === "SELECT" ||
      target.tagName === "TEXTAREA")
  ) {
    validateField(target);
  }
});

/* -------------------------------------------------
   RADIO VALIDATION (gender) on change
--------------------------------------------------*/
document.addEventListener("change", function (e) {
  const form = document.getElementById("student-form");
  if (!form) return;

  if (form.contains(e.target) && e.target.name === "gender") {
    clearError("gender_error");
  }
});

/* -------------------------------------------------
   FORM VALIDATION HELPER FOR ANGULAR SUBMIT
--------------------------------------------------*/

// Call this from Angular's studentFormCtrl before sending to PHP
function validateStudentFormOnSubmit() {
  const form = document.getElementById("student-form");
  if (!form) return false;

  let valid = true;

  const fields = form.querySelectorAll("input, select, textarea");
  fields.forEach((field) => {
    if (!validateField(field)) valid = false;
  });

  const genderSelected = document.querySelector(
    'input[name="gender"]:checked'
  );
  if (!genderSelected) {
    showError("gender_error", "Please select gender.");
    valid = false;
  }

  return valid;
}
// ---------------- STEP-WISE VALIDATION HELPERS ----------------

function validateStep1() {
  const step1Ids = [
    "dob",
    "contact_no",
    "address"
  ];

  let valid = true;

  // validate only step 1 fields
  step1Ids.forEach(id => {
    const el = document.getElementById(id);
    if (el && !validateField(el)) valid = false;
  });

  // gender (radio)
  const genderSelected = document.querySelector('input[name="gender"]:checked');
  if (!genderSelected) {
    showError("gender_error", "Please select gender.");
    valid = false;
  }

  return valid;
}

function validateStep2() {
  const step2Ids = [
    "ssc_school",
    "ssc_board",
    "ssc_percentage",
    "hsc_school",
    "hsc_board",
    "hsc_percentage"
  ];

  let valid = true;

  step2Ids.forEach(id => {
    const el = document.getElementById(id);
    if (el && !validateField(el)) valid = false;
  });

  return valid;
}

