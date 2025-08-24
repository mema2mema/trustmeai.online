// Add-on: hook Team tab and Invite Friends buttons to open invite.html
(function(){
  const TARGET = 'invite.html'; // path to the standalone invite page

  function openInvite(e){
    try{ if(e) e.preventDefault(); }catch(_){}
    window.location.href = TARGET;
    return false;
  }

  function textMatch(el, word){
    try{
      const t = (el.textContent || '').trim().toLowerCase();
      return t === word || t.includes(word);
    }catch(_){ return false; }
  }

  function bind(el){
    if(!el || el.dataset.inviteBound) return;
    el.dataset.inviteBound = '1';
    el.addEventListener('click', openInvite, { passive:false });
  }

  function scan(){
    // Likely selectors for Team nav
    const teamSelectors = [
      '#nav-team','[data-nav="team"]','[data-tab="team"]','a[href="#team"]','.tab-team','.nav .team','button.team','a[href="/team"]',
      'a[href*="#Team"]','a[href*="team"]'
    ];
    teamSelectors.forEach(sel => document.querySelectorAll(sel).forEach(bind));

    // Fallback by text content (Team)
    document.querySelectorAll('a,button,div[role="button"],li,span').forEach(el => {
      if(textMatch(el,'team')) bind(el);
    });

    // Invite Friends buttons
    const inviteSelectors = [
      '#btnInviteFriends','[data-action="invite"]','[data-link="invite"]','a[href*="invite"]','button.invite','a[href="#invite"]'
    ];
    inviteSelectors.forEach(sel => document.querySelectorAll(sel).forEach(bind));

    // Fallback by text content (Invite Friends)
    document.querySelectorAll('a,button,div[role="button"],li,span').forEach(el => {
      if(textMatch(el,'invite friends')) bind(el);
    });
  }

  // Initial + on mutations for SPA navs
  if(document.readyState !== 'loading') scan();
  else document.addEventListener('DOMContentLoaded', scan);

  const mo = new MutationObserver(()=>scan());
  mo.observe(document.documentElement, { childList:true, subtree:true });
})();