// auth-modals.js
(function () {
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const enc = (s) => btoa(unescape(encodeURIComponent(s || "")));
  const dec = (s) => decodeURIComponent(escape(atob(s || "")));

  function modalHtml(id, title, bodyHtml, primaryId, primaryText, switchHtml) {
    return `
<div id="${id}" class="tm-modal" aria-hidden="true">
  <div class="tm-modal__overlay" data-close="${id}"></div>
  <div class="tm-modal__dialog card" role="dialog" aria-modal="true" aria-labelledby="${id}-title">
    <div class="stripe"></div>
    <h2 id="${id}-title" style="font-family:Poppins,Inter,sans-serif;font-weight:700">${title}</h2>
    <div class="tm-modal__body">${bodyHtml}</div>
    ${switchHtml ? `<div class="small" style="margin-top:.5rem">${switchHtml}</div>` : ``}
    <div style="display:flex;gap:.5rem;margin-top:.8rem;justify-content:flex-end">
      ${primaryId ? `<button class="btn" id="${primaryId}">${primaryText}</button>` : ``}
      <button class="btn-ghost" data-close="${id}">Cancel</button>
    </div>
  </div>
</div>`;
  }

  function injectModals() {
    /* LOGIN */
    const loginBody = `
<label class="small">Email</label>
<input id="loginEmail" class="input" type="email" placeholder="you@example.com" autocomplete="username">
<label class="small" style="margin-top:.5rem">Password</label>
<input id="loginPass" class="input" type="password" placeholder="••••••••" autocomplete="current-password">
<div style="display:flex;align-items:center;gap:.5rem;margin-top:.5rem">
  <input id="loginShowPass" type="checkbox">
  <label class="small" for="loginShowPass">Show password</label>
</div>
<div class="small" style="margin-top:.5rem">
  <a href="#" id="forgotLink" class="link">Forgot password?</a>
</div>
`;

    /* REGISTER */
    const registerBody = `
<label class="small">Full Name</label>
<input id="regName" class="input" type="text" placeholder="Your name">
<label class="small" style="margin-top:.5rem">Email</label>
<input id="regEmail" class="input" type="email" placeholder="you@example.com" autocomplete="email">
<label class="small" style="margin-top:.5rem">Password</label>
<input id="regPass" class="input" type="password" placeholder="Create a password" autocomplete="new-password">
<div style="display:flex;align-items:center;gap:.5rem;margin-top:.5rem">
  <input id="regShowPass" type="checkbox">
  <label class="small" for="regShowPass">Show password</label>
</div>
<label class="small" style="margin-top:.5rem">Referral (optional)</label>
<input id="regRef" class="input" type="text" placeholder="Referral code">
`;

    /* RESET PASSWORD */
    const resetBody = `
<label class="small">Email</label>
<input id="resetEmail" class="input" type="email" placeholder="you@example.com" autocomplete="email">
<label class="small" style="margin-top:.5rem">New Password</label>
<input id="resetPass" class="input" type="password" placeholder="New password" autocomplete="new-password">
<label class="small" style="margin-top:.5rem">Confirm Password</label>
<input id="resetPass2" class="input" type="password" placeholder="Repeat new password" autocomplete="new-password">
<div style="display:flex;align-items:center;gap:.5rem;margin-top:.5rem">
  <input id="resetShowPass" type="checkbox">
  <label class="small" for="resetShowPass">Show passwords</label>
</div>
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
      ) +
      modalHtml(
        "resetModal",
        "Reset Password",
        resetBody,
        "btnResetSubmit",
        "Save New Password",
        `Remembered it? <a href="#" id="linkBackToLogin" class="link">Back to Log In</a>`
      );

    document.body.appendChild(root);

    /* Close handlers (overlay/cancel) */
    document.body.addEventListener("click", function (e) {
      const closeId = e.target.getAttribute && e.target.getAttribute("data-close");
      if (closeId) closeModal(closeId);
    });

    /* Switch links */
    document.getElementById("linkToRegister")?.addEventListener("click", function (e) {
      e.preventDefault(); closeModal("loginModal"); openModal("registerModal");
    });
    document.getElementById("linkToLogin")?.addEventListener("click", function (e) {
      e.preventDefault(); closeModal("registerModal"); openModal("loginModal");
    });
    document.getElementById("forgotLink")?.addEventListener("click", function (e) {
      e.preventDefault(); closeModal("loginModal"); openModal("resetModal");
      // pre-fill email if typed
      const le = document.getElementById("loginEmail")?.value || "";
      if (le) document.getElementById("resetEmail").value = le;
    });
    document.getElementById("linkBackToLogin")?.addEventListener("click", function (e) {
      e.preventDefault(); closeModal("resetModal"); openModal("loginModal");
    });

    /* Show password toggles */
    const bindShow = (chkId, ...inputIds) => {
      const c = document.getElementById(chkId);
      if (!c) return;
      c.addEventListener("change", () => {
        inputIds.forEach(id => {
          const i = document.getElementById(id);
          if (i) i.type = c.checked ? "text" : "password";
        });
      });
    };
    bindShow("loginShowPass", "loginPass");
    bindShow("regShowPass", "regPass");
    bindShow("resetShowPass", "resetPass", "resetPass2");

    /* ====== SUBMIT HANDLERS ====== */

    // LOGIN submit (checks stored password if exists)
    document.getElementById("btnLoginSubmit")?.addEventListener("click", function () {
      const email = (document.getElementById("loginEmail") || {}).value?.trim();
      const pass  = (document.getElementById("loginPass") || {}).value;
      if (!email || !pass) return alert("Enter email and password");
      if (!EMAIL_RE.test(email)) return alert("Please enter a valid email address.");

      const storedUser = localStorage.getItem("tmUserEmail");
      const storedHash = localStorage.getItem("tmPassword"); // base64
      if (storedUser && storedHash) {
        if (email !== storedUser || enc(pass) !== storedHash) {
          return alert("Email or password is incorrect.");
        }
      }
      // store session (demo)
      localStorage.setItem("tmUserEmail", email);
      localStorage.setItem("tmLastLogin", Date.now().toString());
      if (!localStorage.getItem("tmMembership")) localStorage.setItem("tmMembership", "T1");

      document.dispatchEvent(new CustomEvent("tm-auth-changed"));
      closeModal("loginModal");
    });

    // REGISTER submit (saves base64 password)
    document.getElementById("btnRegisterSubmit")?.addEventListener("click", function () {
      const email = (document.getElementById("regEmail") || {}).value?.trim();
      const pass  = (document.getElementById("regPass") || {}).value;
      if (!email || !pass) return alert("Enter email and password");
      if (!EMAIL_RE.test(email)) return alert("Please enter a valid email address.");

      localStorage.setItem("tmUserEmail", email);
      localStorage.setItem("tmPassword", enc(pass));           // demo only
      localStorage.setItem("tmNickname", (email.split("@")[0] || "User"));
      localStorage.setItem("tmMembership", localStorage.getItem("tmMembership") || "T1");
      if (!localStorage.getItem("tmRegTime")) localStorage.setItem("tmRegTime", Date.now().toString());
      localStorage.setItem("tmLastLogin", Date.now().toString());

      document.dispatchEvent(new CustomEvent("tm-auth-changed"));
      closeModal("registerModal");
    });

    // RESET submit
    document.getElementById("btnResetSubmit")?.addEventListener("click", function () {
      const email = (document.getElementById("resetEmail") || {}).value?.trim();
      const p1    = (document.getElementById("resetPass") || {}).value;
      const p2    = (document.getElementById("resetPass2") || {}).value;

      if (!EMAIL_RE.test(email)) return alert("Enter a valid email.");
      if (!p1 || !p2) return alert("Enter the new password twice.");
      if (p1 !== p2) return alert("Passwords do not match.");

      // demo: simply save as base64
      localStorage.setItem("tmUserEmail", email);
      localStorage.setItem("tmPassword", enc(p1));
      localStorage.setItem("tmLastLogin", Date.now().toString()); // optional

      alert("Password updated.");
      document.dispatchEvent(new CustomEvent("tm-auth-changed"));
      closeModal("resetModal");
    });
  }

  // Public helpers
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

  document.addEventListener("DOMContentLoaded", injectModals);
})();
