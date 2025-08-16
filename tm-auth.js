// Simple LocalStorage-based demo auth
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

let tempCode = null;
let codeExpiry = null;

document.addEventListener("DOMContentLoaded", () => {
  const sendCodeBtn = document.getElementById("sendCodeBtn");
  if (sendCodeBtn) {
    sendCodeBtn.addEventListener("click", () => {
      const email = document.getElementById("regEmail").value;
      const pw = document.getElementById("regPassword").value;
      const pw2 = document.getElementById("regPassword2").value;
      if (!email || !pw || !pw2 || pw !== pw2) {
        alert("Please enter valid email and matching passwords.");
        return;
      }
      tempCode = generateCode();
      codeExpiry = Date.now() + 10 * 60 * 1000; // 10 min
      alert("Your confirmation code is: " + tempCode + " (demo)");
      document.getElementById("codeSection").style.display = "block";
      document.getElementById("sendCodeBtn").style.display = "none";
      document.getElementById("createBtn").style.display = "inline-block";
    });
  }

  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("regEmail").value;
      const pw = document.getElementById("regPassword").value;
      const code = document.getElementById("regCode").value;
      const ref = document.getElementById("regReferral").value;

      if (code !== tempCode || Date.now() > codeExpiry) {
        alert("Invalid or expired code.");
        return;
      }
      localStorage.setItem("user", JSON.stringify({ email, pw, ref }));
      alert("Account created! You are now logged in.");
      window.location.href = "index.html";
    });
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value;
      const pw = document.getElementById("loginPassword").value;
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user.email === email && user.pw === pw) {
        alert("Login successful!");
        window.location.href = "index.html";
      } else {
        alert("Invalid login.");
      }
    });
  }
});
