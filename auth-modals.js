// auth-modals.js
(function () {
  function modalHtml(id, title, bodyHtml, primaryId, primaryText, switchHtml) {
    return `
<div id="${id}" class="tm-modal" aria-hidden="true">
  <div class="tm-modal__overlay" data-close="${id}"></div>
  <div class="tm-modal__dialog card" role="dialog" aria-modal="true" aria-labelledby="${id}-title">
    <div class="stripe"></div>
    <h2 id="${id}-title" style="font-family:Poppins,Inter,sans-serif;font-weight:700">${title}</h2>
    <div class="tm-modal__body">${bodyHtml}</div>
    <div class="small" style="margin-top:.5rem">${switchHtml}</div>
    <div style="display:flex;gap:.5rem;margin-top:.8rem;justify-content:flex-end">
      <button class="btn" id="${primaryId}">${primaryText}</button>
      <button class="btn-ghost" data-close="${id}">Cancel</button>
    </div>
  </div>
</div>`;
  }

  function injectModals() {
    const loginBody = `
<label class="small">Email</label>
<input id="loginEmail" class="input" type="email" placeholder="you@example.com" autocomplete="username">
<label class="small" style="margin-top:.5rem">Password</label>
<input id="loginPass" class="input" type="password" placeholder="••••••••" autocomplete="current-password">
`;
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
      modalHtml(
        "loginModal",
        "Log In",
        loginBody,
        "btnLoginSubmit",
        "Log In",
        `Don't have an account? <a href="#" id="linkToRegister" class="link">Register</a>`
      ) +
      modalHtml(
        "registerModal",
        "Create Account",
        registerBody,
        "btnRegisterSubmit",
        "Register",
        `Already have an account? <a href="#" id="linkToLogin" class="link">Log In</a>`
      );
    document.body.appendChild(root);

    // Close handlers (overlay/cancel)
    document.body.addEventListener("click", function (e) {
      const closeId = e.target.getAttribute && e.target.getAttribute("data-close");
      if (closeId) closeModal(closeId);
    });

    // Switch links
    document.getElementById("linkToRegister")?.addEventListener("click", function (e) {
      e.preventDefault(); closeModal("loginModal"); openModal("registerModal");
    });
    document.getElementById("linkToLogin")?.addEventListener("click", function (e) {
      e.preventDefault(); closeModal("registerModal"); openModal("loginModal");
    });

    // ====== SUBMIT HANDLERS (with timestamps) ======

    // LOGIN submit
    document.getElementById("btnLoginSubmit")?.addEventListener("click", function () {
      const email = (document.getElementById("loginEmail") || {}).value?.trim();
      const pass  = (document.getElementById("loginPass") || {}).value;
      if (!email || !pass) return alert("Enter email and password");

      localStorage.setItem("tmUserEmail", email);
      // update last login time
      localStorage.setItem("tmLastLogin", Date.now().toString());

      document.dispatchEvent(new CustomEvent("tm-auth-changed"));
      closeModal("loginModal");
    });

    // REGISTER submit
    document.getElementById("btnRegisterSubmit")?.addEventListener("click", function () {
      const email = (document.getElementById("regEmail") || {}).value?.trim();
      const pass  = (document.getElementById("regPass") || {}).value;
      if (!email || !pass) return alert("Enter email and password");

      // Save user fields (demo) and auto-login
      localStorage.setItem("tmUserEmail", email);
      localStorage.setItem("tmNickname", email.split("@")[0]); // default nickname
      localStorage.setItem("tmMembership", "S0");              // default level
      if (!localStorage.getItem("tmRegTime")) {
        localStorage.setItem("tmRegTime", Date.now().toString());
      }
      localStorage.setItem("tmLastLogin", Date.now().toString());

      document.dispatchEvent(new CustomEvent("tm-auth-changed"));
      closeModal("registerModal");
    });
  }

  // Public helpers for loader
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
  window.tmLogout = function () {
    localStorage.removeItem("tmUserEmail");
    document.dispatchEvent(new CustomEvent("tm-auth-changed"));
  };

  // Build modals after DOM ready
  document.addEventListener("DOMContentLoaded", injectModals);
})();
