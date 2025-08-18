document.addEventListener("DOMContentLoaded", function () {
  const authArea = document.getElementById("authArea");
  if (!authArea) return;

  // Inject the two buttons
  Promise.all([
    fetch("login.html").then(r => r.text()).catch(() => ""),
    fetch("register.html").then(r => r.text()).catch(() => "")
  ]).then(([loginBtnHtml, registerBtnHtml]) => {
    authArea.insertAdjacentHTML("beforeend", loginBtnHtml || "");
    authArea.insertAdjacentHTML("beforeend", registerBtnHtml || "");

    // Wire open handlers (modals are created by auth-modals.js)
    const openLoginBtn = document.getElementById("openLogin");
    const openRegisterBtn = document.getElementById("openRegister");
    if (openLoginBtn) openLoginBtn.addEventListener("click", () => openModal("loginModal"));
    if (openRegisterBtn) openRegisterBtn.addEventListener("click", () => openModal("registerModal"));
  });
});
