/**
 * addons/invite-hook.js
 * - Makes the whole "Invite Friends" tile clickable (not just the text)
 * - Provides a fallback for the Team tab navigation
 * Drop this file into /addons and ensure you have:
 *   <script src="./addons/invite-hook.js" defer></script>
 * just above </body> on pages that show the Team section.
 */
(function () {
  function goto(url) { window.location.href = url; }

  function wireTeamAndInvite() {
    // 1) Make the entire "Invite Friends" card clickable
    try {
      const candidates = Array.from(
        document.querySelectorAll('.card, .tile, [class*="card"], [class*="tile"], [role="button"]')
      );
      const inviteTile = candidates.find(el => /invite\s*friends/i.test((el.textContent || '').trim()));
      if (inviteTile) {
        inviteTile.style.cursor = 'pointer';
        inviteTile.addEventListener('click', function (e) {
          // If user clicked a nested real <a>, let that win
          if (e.target.closest('a')) return;
          goto('./invite.html');
        }, { passive: true });
      }
    } catch (e) { console.warn('Invite tile wire failed:', e); }

    // 2) Fallback for Team nav button
    try {
      const teamButtons = document.querySelectorAll('[data-tab="team"], a[href="#team"], button[href="#team"]');
      teamButtons.forEach(btn => {
        if (btn.dataset.teamWired === '1') return;
        btn.dataset.teamWired = '1';
        btn.addEventListener('click', () => {
          setTimeout(() => {
            if (!location.hash || location.hash === '#') {
              location.hash = '#team';
            }
          }, 0);
        }, { passive: true });
      });
    } catch (e) { console.warn('Team nav wire failed:', e); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireTeamAndInvite);
  } else {
    wireTeamAndInvite();
  }
  window.addEventListener('hashchange', wireTeamAndInvite);
  setTimeout(wireTeamAndInvite, 600);
})();