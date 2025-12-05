// js/cal.js

// Safely get the display element each time
function getDisplay() {
  return document.getElementById("display");
}

function append(value) {
  const display = getDisplay();
  if (!display) return;
  display.value += value;
}

function clearDisplay() {
  const display = getDisplay();
  if (!display) return;
  display.value = "";
}

function deleteLast() {
  const display = getDisplay();
  if (!display) return;
  display.value = display.value.slice(0, -1);
}

function calculate() {
  const display = getDisplay();
  if (!display) return;

  try {
    // NOTE: This is just a simple project demo; eval is ok here.
    const result = eval(display.value);
    display.value = result;
  } catch (error) {
    display.value = "Error";
  }
}

// Allow keyboard input (works both in normal and routed mode)
document.addEventListener("keydown", function (event) {
  const display = getDisplay();
  if (!display) return; // not on calculator page

  const key = event.key;

  if (!isNaN(key) || ["+", "-", "*", "/", "."].includes(key)) {
    append(key);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculate();
  } else if (key === "Backspace") {
    deleteLast();
  } else if (key === "c" || key === "C" || key === "Escape") {
    clearDisplay();
  }
});
