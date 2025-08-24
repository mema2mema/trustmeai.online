// TrustMe AI - Team / Invite hook (navigation + light wiring)
(function () {
  function openInvite() {
    // Use a standalone page for now; easy to integrate with SPA later
    window.location.href = 'invite.html';
  }

  function wireInviteBox() {
    const box = document.getElementById('inviteBox');
    if (box && !box.dataset.wired) {
      box.style.cursor = 'pointer';
      box.title = 'Open Invite Friends';
      box.dataset.wired = '1';
      box.addEventListener('click', openInvite);
    }
  }

  function ensureInviteCard() {
    // Try to append an Invite card into the Team page if we can find it
    const teamPage = document.getElementById('page-team') || document.querySelector('[data-page="team"]') || document.querySelector('#team, .team-page, main');
    if (!teamPage) return;

    if (!document.getElementById('inviteBox')) {
      const card = document.createElement('div');
      card.className = 'card';
      card.id = 'inviteBox';
      card.innerHTML = '<h3 style="margin:0 0 4px">Invite Friends</h3><p style="margin:0;color:#9aa3af">Share your invite link and earn rewards.</p>';
      // Try to place it nicely after the first card/section; otherwise append
      const firstCard = teamPage.querySelector('.card, section, .panel');
      if (firstCard && firstCard.parentNode) {
        firstCard.parentNode.insertBefore(card, firstCard.nextSibling);
      } else {
        teamPage.appendChild(card);
      }
    }
    wireInviteBox();
  }

  function wireAnyInviteButtons() {
    // If a tile or button says "Invite Friends", clicking it should open the invite page
    const candidates = Array.from(document.querySelectorAll('a,button,div,li'))
      .filter(el => /invite\s*friends/i.test(el.textContent || ''));
    for (const el of candidates) {
      if (!el.dataset.inviteWired) {
        el.dataset.inviteWired = '1';
        el.addEventListener('click', function (e) {
          // prevent double navigation if it already has a link
          e.preventDefault();
          e.stopPropagation();
          openInvite();
        });
        el.style.cursor = 'pointer';
      }
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    // If the Team tab exists, add a one-time enhancer when user opens it
    const teamTab = document.querySelector('nav [data-tab="team"], .tabbar [data-tab="team"], [data-nav="team"]');
    if (teamTab && !teamTab.dataset.hooked) {
      teamTab.dataset.hooked = '1';
      teamTab.addEventListener('click', function () {
        setTimeout(() => {
          ensureInviteCard();
          wireAnyInviteButtons();
        }, 50);
      });
    }

    // Run once on load too (for SSR/static pages that render Team immediately)
    ensureInviteCard();
    wireInviteBox();
    wireAnyInviteButtons();
    console.log('[invite-hook] active');
  });
})();
