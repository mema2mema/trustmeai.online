// Minimal modal system using your theme classes
(function () {
  function modalHtml(id, title, bodyHtml, primaryId, primaryText) {
    return `
<div id="${id}" class="tm-modal" aria-hidden="true">
  <div class="tm-modal__overlay" data-close="${id}"></div>
  <div class="tm-modal__dialog card" role="dialog" aria-modal="true" aria-labelledby="${id}-title">
    <div class="stripe"></div>
    <h2 id="${id}-title" style="font-family:Poppins,Inter,sans-serif;font-weight:700">${title}</h2>
    <div class="tm-modal__body">${bodyHtml}</div>
    <div style="display:flex;gap:.5rem;margin-top:.8rem;justify-content:flex-end">
      <button class="btn" id="${primaryId}">${primaryText}</button>
      <button class="btn-ghost" data-close="${id}">Cancel</button>
    </div>
  </div>
</div>`;
  }

  function injectModals() {
    // Login form
    const loginBody = `
<label class="small">Email</label>
<input id="loginEmail" class="input" type="email" placeholder="you@example.com" autocomplete="username">
<label class="small" style="margin-top:.5rem">Password</label>
<input id="loginPass" class="input" type="password" placeholder="••••••••" autocomplete="current-password">
<div class="small" style="margin-top:.5rem"><a href="#" class="link">Forgot password?</a></div>
`;
    // Register form
    const registerBody = `
<label class="small">Full Name</label>
<input id="regName" class="input" type="text" placeholder="Your name">
<label class="small" style="margin-top:.5rem">Email</label>
<input id="regEmail" class="input" type="email" placeholder="you@example.com" autocomplete="email">
<label class="small" style="margin-top:.5rem">Password</label>
<input id="regPass" class="input" type="password" placeholder="Create a password" autocomplete="new-password">
<label class="small" style="margin-top:.5rem">Referral (optional)</label>
<input id="regRef" class="input" type="text" placeholder="Referral code">
`;

    const root = document.createElement("div");
    root.innerHTML =
      modalHtml("loginModal", "Log In", loginBody, "btnLoginSubmit", "Log In") +
      modalHtml("registerModal", "Create Account", registerBody, "btnRegisterSubmit", "Register");
    document.body.appendChild(root);

    // Close handlers (overlay & cancel buttons)
    document.body.addEventListener("click", function (e) {
      const target = e.target;
      const closeId = target.getAttribute && target.getAttribute("data-close");
      if (closeId) closeModal(closeId);
    });

    // ESC to close
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeModal("loginModal");
        closeModal("registerModal");
      }
    });

    // Demo submit handlers (replace with real auth later)
    document.getElementById("btnLoginSubmit")?.addEventListener("click", function () {
      const email = (document.getElementById("loginEmail") || {}).value || "";
      const pass = (document.getElementById("loginPass") || {}).value || "";
      if (!email || !pass) return alert("Enter email and password");
      // TODO: integrate TMAuth here
      alert("Logged in (demo).");
      closeModal("loginModal");
    });

    document.getElementById("btnRegisterSubmit")?.addEventListener("click", function () {
      const email = (document.getElementById("regEmail") || {}).value || "";
      const pass = (document.getElementById("regPass") || {}).value || "";
      if (!email || !pass) return alert("Enter email and password");
      // TODO: integrate TMAuth register here
      alert("Account created (demo).");
      closeModal("registerModal");
    });
  }

  // Public helpers used by auth-loader.js
  window.openModal = function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add("open");
    document.documentElement.classList.add("tm-modal-open");
  };
  window.closeModal = function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove("open");
    if (![...document.querySelectorAll(".tm-modal.open")].length) {
      document.documentElement.classList.remove("tm-modal-open");
    }
  };

  // Build modals after DOM ready
  document.addEventListener("DOMContentLoaded", injectModals);
})();
