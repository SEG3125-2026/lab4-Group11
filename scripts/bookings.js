// scripts/booking.js

// Enable Bootstrap tooltips (needs jQuery + Bootstrap JS loaded first)
$(function () {
  $('[data-toggle="tooltip"]').tooltip();
});

const state = {
  serviceName: "",
  servicePrice: 0,
  serviceDuration: 0,
  date: "",
  time: "",
  fullName: "",
  email: "",
  phone: "",
  notes: ""
};

const summaryText = document.getElementById("summaryText");
const btnToDate = document.getElementById("btnToDate");
const btnToInfo = document.getElementById("btnToInfo");
const btnSubmit = document.getElementById("btnSubmit");

const dateInput = document.getElementById("dateInput");
const timeSelect = document.getElementById("timeSelect");
const durationHint = document.getElementById("durationHint");

const bookingForm = document.getElementById("bookingForm");
const confirmation = document.getElementById("confirmation");
const confirmDetails = document.getElementById("confirmDetails");

function money(n) {
  return "$" + Number(n).toFixed(2);
}

function updateSummary() {
  const parts = [];

  if (state.serviceName) {
    parts.push(`<strong>Service:</strong> ${state.serviceName} (${money(state.servicePrice)})`);
  } else {
    parts.push(`<strong>Service:</strong> not selected`);
  }

  if (state.date && state.time) {
    parts.push(`<strong>When:</strong> ${state.date} at ${state.time}`);
  } else {
    parts.push(`<strong>When:</strong> not selected`);
  }

  summaryText.innerHTML = "You chose…<br>" + parts.join("<br>");
}

function openAccordion(targetId) {
  $(".collapse").collapse("hide");
  $(targetId).collapse("show");

  const acc = document.querySelector("#accordion");
  if (acc) {
    window.scrollTo({ top: acc.offsetTop - 20, behavior: "smooth" });
  }
}

function buildTimeslots() {
  const slots = [
    "10:00","10:30","11:00","11:30","12:00","12:30",
    "1:00","1:30","2:00","2:30","3:00","3:30",
    "4:00","4:30","5:00","5:30","6:00"
  ];

  timeSelect.innerHTML =
    `<option value="">Choose a time</option>` +
    slots.map(t => `<option value="${t}">${t}</option>`).join("");

  timeSelect.disabled = false;
}

function validateStep2() {
  const ready = Boolean(state.date && state.time);
  btnToInfo.style.display = ready ? "inline-flex" : "none";
  updateSummary();
}

function validateFormReadiness() {
  const nameOk = state.fullName.trim().length >= 2;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim());
  const phoneOk = state.phone.trim().length >= 7;

  btnSubmit.disabled = !(
    nameOk &&
    emailOk &&
    phoneOk &&
    state.serviceName &&
    state.date &&
    state.time
  );

  updateSummary();
}

// Step 1: service selection
document.querySelectorAll('input[name="service"]').forEach(radio => {
  radio.addEventListener("change", (e) => {
    const el = e.target;
    state.serviceName = el.dataset.name;
    state.servicePrice = Number(el.dataset.price);
    state.serviceDuration = Number(el.dataset.duration);

    durationHint.textContent = `Estimated duration: ${state.serviceDuration} minutes.`;
    btnToDate.style.display = "inline-flex";
    updateSummary();
  });
});

btnToDate.addEventListener("click", () => openAccordion("#collapseDate"));

// Step 2: set min date to today
(function setMinDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  dateInput.min = `${yyyy}-${mm}-${dd}`;
})();

dateInput.addEventListener("change", () => {
  state.date = dateInput.value;
  state.time = "";
  buildTimeslots();
  timeSelect.value = "";
  validateStep2();
});

timeSelect.addEventListener("change", () => {
  state.time = timeSelect.value;
  validateStep2();
});

btnToInfo.addEventListener("click", () => openAccordion("#collapseInfo"));

document.getElementById("btnBackToService").addEventListener("click", () => openAccordion("#collapseService"));
document.getElementById("btnBackToDate").addEventListener("click", () => openAccordion("#collapseDate"));

// Step 3: contact info
["fullName", "email", "phone", "notes"].forEach(id => {
  document.getElementById(id).addEventListener("input", (e) => {
    state[id] = e.target.value;
    validateFormReadiness();
  });
});

bookingForm.addEventListener("submit", (e) => {
  e.preventDefault();

  bookingForm.classList.add("was-validated");
  validateFormReadiness();
  if (btnSubmit.disabled) return;

  confirmDetails.innerHTML = `
    <div><strong>Service:</strong> ${state.serviceName} (${money(state.servicePrice)})</div>
    <div><strong>Date:</strong> ${state.date}</div>
    <div><strong>Time:</strong> ${state.time}</div>
    <div><strong>Name:</strong> ${escapeHtml(state.fullName)}</div>
    <div><strong>Email:</strong> ${escapeHtml(state.email)}</div>
    <div><strong>Phone:</strong> ${escapeHtml(state.phone)}</div>
    ${state.notes ? `<div><strong>Notes:</strong> ${escapeHtml(state.notes)}</div>` : ""}
  `;

  confirmation.style.display = "block";
  window.scrollTo({ top: confirmation.offsetTop - 20, behavior: "smooth" });
});

document.getElementById("btnStartOver").addEventListener("click", () => {
  state.serviceName = "";
  state.servicePrice = 0;
  state.serviceDuration = 0;
  state.date = "";
  state.time = "";
  state.fullName = "";
  state.email = "";
  state.phone = "";
  state.notes = "";

  document.querySelectorAll('input[name="service"]').forEach(r => (r.checked = false));
  btnToDate.style.display = "none";
  btnToInfo.style.display = "none";

  dateInput.value = "";
  timeSelect.innerHTML = `<option value="">Select a date first</option>`;
  timeSelect.disabled = true;

  ["fullName", "email", "phone", "notes"].forEach(id => (document.getElementById(id).value = ""));
  bookingForm.classList.remove("was-validated");
  btnSubmit.disabled = true;

  confirmation.style.display = "none";
  updateSummary();
  openAccordion("#collapseService");
});

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Initial summary
updateSummary();
