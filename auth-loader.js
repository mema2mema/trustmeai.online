// auth-loader.js
(function () {
  // Inject minimal dropdown CSS so you don't have to edit style.css
  function ensureDropdownCss() {
    if (document.getElementById("authDropdownStyles")) return;
    const css = `
.user-menu{position:relative;display:inline-block;}
.user-toggle{cursor:pointer;font-weight:600;padding:6px 12px;background:var(--soft);border-radius:6px;border:0;color:inherit}
.user-dropdown{display:none;position:absolute;right:0;top:calc(100% + 6px);background:var(--panel,#0d1224);border:1px solid rgba(255,255,255,.08);border-radius:12px;min-width:200px;max-height:220px;overflow:auto;box-shadow:0 12px 30px rgba(0,0,0,.35);z-index:1000}
.user-dropdown.show{display:block;}
.user-dropdown a, .user-dropdown button{display:block;width:100%;text-align:left;padding:10px 12px;color:#EAF2FF;text-decoration:none;background:transparent;border:0;cursor:pointer;font:inherit}
.user-dropdown a:hover, .user-dropdown button:hover{background:rgba(255,255,255,.06);}
    `;
    const style = document.createElement("style");
    style.id = "authDropdownStyles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function renderAuthUI() {
    ensureDropdownCss();

    const authArea = document.getElementById("authArea");
    if (!authArea) return;

    const email = localStorage.getItem("tmUserEmail");
    if (email) {
      authArea.innerHTML = `
        <div class="user-menu">
          <button class="user-toggle" id="userToggle">Hi, ${email} ▾</button>
          <div class="user-dropdown" id="userMenu">
            <a href="profile.html">My Profile</a>
            <a href="strategy.html">Strategy Plans</a>
            <a href="deposit.html">Deposit</a>
            <a href="withdraw.html">Withdraw</a>
            <button id="copyReferral">Copy Referral Link</button>
            <button id="tmLogoutBtn">Log Out</button>
          </div>
        </div>
      `;

      const toggle = document.getElementById("userToggle");
      const menu   = document.getElementById("userMenu");

      function closeAll() { menu.classList.remove("show"); }
      toggle?.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.classList.toggle("show");
      });
      document.addEventListener("click", closeAll);

      document.getElementById("tmLogoutBtn")?.addEventListener("click", () => {
        if (window.tmLogout) window.tmLogout();
        else {
          localStorage.removeItem("tmUserEmail");
          document.dispatchEvent(new CustomEvent("tm-auth-changed"));
        }
        closeAll();
      });

      document.getElementById("copyReferral")?.addEventListener("click", async () => {
        // Placeholder referral link; customize later
        const ref = location.origin + "/?ref=" + encodeURIComponent(email);
        try { await navigator.clipboard.writeText(ref); alert("Referral link copied!"); }
        catch { alert(ref); }
        closeAll();
      });

    } else {
      // Not logged in: inject the two buttons
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
