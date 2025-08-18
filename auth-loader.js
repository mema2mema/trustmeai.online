document.addEventListener("DOMContentLoaded", function(){
  const authArea = document.getElementById("authArea");
  if (!authArea) return;

  // Load login.html
  fetch("login.html")
    .then(res => res.text())
    .then(html => authArea.insertAdjacentHTML("beforeend", html));

  // Load register.html
  fetch("register.html")
    .then(res => res.text())
    .then(html => authArea.insertAdjacentHTML("beforeend", html));
});
