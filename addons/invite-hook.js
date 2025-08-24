/**
 * addons/invite-hook.js
 * Make any element with data-goto="invite" (card, button, row, etc.) open invite.html.
 * Works on Home, Team, and Mine without touching existing logic.
 */
(function () {
  function onClick(e) {
    const el = e.target.closest('[data-goto="invite"]');
    if (!el) return;
    e.preventDefault();
    const href = el.getAttribute('data-href') || 'invite.html';
    window.location.href = href;
  }
  function onKey(e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-goto="invite"]')) {
      e.preventDefault();
      const href = e.target.getAttribute('data-href') || 'invite.html';
      window.location.href = href;
    }
  }
  document.addEventListener('click', onClick);
  document.addEventListener('keydown', onKey);
  const cards = document.querySelectorAll('[data-goto="invite"]:not([role])');
  cards.forEach(c => {
    c.setAttribute('role', 'button');
    c.setAttribute('tabindex', '0');
    if (!c.getAttribute('aria-label')) c.setAttribute('aria-label', 'Invite Friends');
  });
})();