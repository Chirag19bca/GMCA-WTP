// js/register.js

// ------------------------------
// Helpers
// ------------------------------
function showError(id, message) {
  const el = document.getElementById(id);
  if (el) el.textContent = message;
}

function clearError(id) {
  const el = document.getElementById(id);
  if (el) el.textContent = "";
}

function v(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

// ------------------------------
// Main field validation
// (used for BOTH register + login)
// ------------------------------
function validateRegisterField(field) {
  if (!field || !field.id) return true;
  const id = field.id;
  const value = v(id);
  let ok = true;

  switch (id) {
    case "enrollment_no":
      if (!value) {
        showError("enrollment_no_error", "Enrollment number is required.");
        ok = false;
      } else if (!/^[0-9]+$/.test(value)) {
        showError("enrollment_no_error", "Only digits are allowed.");
        ok = false;
      } else if (value.length !== 12) {
        showError("enrollment_no_error", "Enrollment number must be 12 digits.");
        ok = false;
      } else clearError("enrollment_no_error");
      break;

    case "fname":
      // only exists on register form
      if (!value) {
        showError("fname_error", "First name is required.");
        ok = false;
      } else if (!/^[a-zA-Z\s]+$/.test(value)) {
        showError("fname_error", "Only letters are allowed.");
        ok = false;
      } else clearError("fname_error");
      break;

    case "lname":
      // only exists on register form
      if (!value) {
        showError("lname_error", "Last name is required.");
        ok = false;
      } else if (!/^[a-zA-Z\s]+$/.test(value)) {
        showError("lname_error", "Only letters are allowed.");
        ok = false;
      } else clearError("lname_error");
      break;

    case "email":
      // used in both register + login
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        showError("email_error", "Enter a valid email.");
        ok = false;
      } else clearError("email_error");
      break;

    case "password":
      // SAME rules for BOTH register + login
      const pass = value;
      const uppercase = /[A-Z]/;
      const digit = /[0-9]/;
      const special = /[@#$]/;

      if (pass.length < 8) {
        showError("password_error", "Min 8 characters required.");
        ok = false;
      } else if (!uppercase.test(pass)) {
        showError(
          "password_error",
          "Password must contain at least 1 uppercase letter."
        );
        ok = false;
      } else if (!digit.test(pass)) {
        showError("password_error", "Password must contain at least 1 digit.");
        ok = false;
      } else if (!special.test(pass)) {
        showError("password_error", "Use at least one of @ # $");
        ok = false;
      } else clearError("password_error");
      break;
  }

  return ok;
}

// ------------------------------
// Get active form (register OR login)
// ------------------------------
function getActiveAuthForm() {
  const regForm = document.getElementById("register-form");
  const logForm = document.getElementById("login-form");

  if (regForm) return regForm;
  if (logForm) return logForm;
  return null;
}

// ------------------------------
// Live validation (blur + input)
// works for whichever form exists
// ------------------------------
document.addEventListener(
  "blur",
  function (e) {
    const form = document.getElementById("register-form");
    if (!form) return;
    if (form.contains(e.target) && e.target.tagName === "INPUT") {
      validateRegisterField(e.target);
    }
  },
  true
);


document.addEventListener("input", function (e) {
  const form = getActiveAuthForm();
  if (!form) return;

  if (form.contains(e.target) && e.target.tagName === "INPUT") {
    validateRegisterField(e.target);
  }
});

// ------------------------------
// Form validation helper
// (you can call this from Angular if you want)
// ------------------------------
function validateRegisterFormOnSubmit() {
  const form = getActiveAuthForm();
  if (!form) return false;

  let valid = true;
  const fields = form.querySelectorAll("input");
  fields.forEach((f) => {
    if (!validateRegisterField(f)) valid = false;
  });

  return valid;
}

/*
// OLD plain-submit behaviour for register form
// (still only for #register-form; we leave it disabled
// because login is using Angular ng-submit)

document.addEventListener("submit", function (event) {
  const form = event.target;
  if (!form || form.id !== "register-form") return;

  event.preventDefault();
  const ok = validateRegisterFormOnSubmit();
  if (ok) {
    form.submit();
  }
});
*/
