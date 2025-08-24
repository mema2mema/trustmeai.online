// TrustMe AI - Team / Invite hook (safe minimal version)
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    console.log('[invite-hook] loaded');
    // Optional: enhance the Team tab once on first open
    const teamBtn = document.querySelector('nav.tabbar button[data-tab="team"]');
    if (teamBtn) {
      teamBtn.addEventListener('click', function onOpen() {
        const page = document.getElementById('page-team');
        if (!page) return;
        // Add a simple Invite box if not present
        if (!document.getElementById('inviteBox')) {
          const box = document.createElement('div');
          box.className = 'card';
          box.id = 'inviteBox';
          box.innerHTML = '<h3>Invite Friends</h3><p>Share your invite link and earn rewards.</p>';
          page.appendChild(box);
        }
        // only run once
        teamBtn.removeEventListener('click', onOpen);
      });
    }
  });
})();
