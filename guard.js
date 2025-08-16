/* guard.js — simple page guard for protected pages */
document.addEventListener('DOMContentLoaded', () => {
  const mustAuth = document.body && document.body.getAttribute('data-auth') === 'required';
  if (!mustAuth) return;
  if (!window.TMAuth || !TMAuth.auth || !TMAuth.auth()) {
    const here = location.pathname.split('/').pop() || 'index.html';
    location.href = 'login.html?next=' + encodeURIComponent(here);
  }
});