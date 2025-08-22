class TmAuthHeader extends HTMLElement {
  connectedCallback() {
    const token = localStorage.getItem("token");
    this.innerHTML = `
      <header style="padding:10px; background:#222; color:#fff; display:flex; justify-content:space-between; align-items:center;">
        <span><b>TrustMe AI</b></span>
        <nav>
          ${token ? `
            <a href="account.html" style="color:#0f0; margin-right:10px;">Account</a>
            <a href="#" id="logoutBtn" style="color:#f55;">Logout</a>
          ` : `
            <a href="login.html" style="color:#0f0; margin-right:10px;">Login</a>
            <a href="register.html" style="color:#0f0;">Register</a>
          `}
        </nav>
      </header>
    `;

    if (token) {
      this.querySelector("#logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "login.html";
      });
    }
  }
}

customElements.define("tm-auth-header", TmAuthHeader);
