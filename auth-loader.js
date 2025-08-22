// auth-loader.js
(function () {
  function renderAuthUI() {
    const authArea = document.getElementById("authArea");
    if (!authArea) return;

    const email = localStorage.getItem("tmUserEmail");
    if (email) {
      authArea.innerHTML = `
        <span class="small" style="margin-right:.6rem">Hi, ${email}</span>
        <button class="btn-ghost" id="tmLogoutBtn" type="button">Logout</button>
      `;
      const btn = document.getElementById("tmLogoutBtn");
      if (btn) btn.addEventListener("click", () => {
        window.tmLogout && window.tmLogout();
      });
    } else {
      Promise.all([
        fetch("login.html").then(r => r.text()).catch(() => ""),
        fetch("register.html").then(r => r.text()).catch(() => "")
      ]).then(([loginBtnHtml, registerBtnHtml]) => {
        authArea.innerHTML = "";
        authArea.insertAdjacentHTML("beforeend", loginBtnHtml || "");
        authArea.insertAdjacentHTML("beforeend", registerBtnHtml || "");

        document.getElementById("openLogin")?.addEventListener("click", () => openModal("loginModal"));
        document.getElementById("openRegister")?.addEventListener("click", () => openModal("registerModal"));
      });
    }
  }

  // Re-render whenever auth changes
  document.addEventListener("tm-auth-changed", renderAuthUI);

  // Initial render
  document.addEventListener("DOMContentLoaded", renderAuthUI);
})();
