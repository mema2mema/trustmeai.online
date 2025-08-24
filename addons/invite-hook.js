
// Attach navigation for Team/Invite Friends -> invite.html
document.addEventListener('DOMContentLoaded', () => {
  const goInvite = (e) => {
    try { e.preventDefault(); } catch(_) {}
    window.location.href = './invite.html';
    return false;
  };

  const tryBind = () => {
    // Anything that clearly looks like "Invite Friends"
    const inviteSelectors = [
      '#inviteFriends', '.invite-friends', 'a[href*="invite"]', 'button[data-action="invite"]'
    ];
    inviteSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        if (!el.__tm_bound) {
          el.addEventListener('click', goInvite);
          el.__tm_bound = true;
        }
      });
    });

    // Match by text content as fallback
    Array.from(document.querySelectorAll('button, a, div, span')).forEach(el => {
      const txt = (el.textContent || '').trim().toLowerCase();
      if (txt === 'invite friends' || txt === 'invite' || txt === 'share your invite link') {
        if (!el.__tm_bound) {
          el.addEventListener('click', goInvite);
          el.__tm_bound = true;
        }
      }
    });
  };

  // initial & observe DOM changes
  tryBind();
  const obs = new MutationObserver(tryBind);
  obs.observe(document.documentElement, { childList: true, subtree: true });
});
