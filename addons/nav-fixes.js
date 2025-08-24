/**
 * addons/nav-fixes.js
 * Ensures bottom nav tabs are fully clickable and hash routes (#home, #assets, #strategy, #team, #mine)
 * toggle matching view panels with ids: view-home, view-assets, view-strategy, view-team, view-mine
 * If your app already has a router, this will no-op and stay out of the way.
 */
(function () {
  const routes = ['home', 'assets', 'strategy', 'team', 'mine'];
  function showRoute(route) {
    routes.forEach(r => {
      const panel = document.getElementById('view-' + r);
      if (!panel) return;
      panel.style.display = (r === route) ? '' : 'none';
    });
    const tabs = document.querySelectorAll('[data-route]');
    tabs.forEach(t => {
      if (t.getAttribute('data-route') === '#' + route) t.classList.add('active');
      else t.classList.remove('active');
    });
  }
  function currentRoute() {
    const h = (window.location.hash || '#home').replace('#', '');
    return routes.includes(h) ? h : 'home';
  }
  document.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-route]');
    if (!tab) return;
    e.preventDefault();
    const to = tab.getAttribute('data-route');
    if (!to) return;
    window.location.hash = to;
  });
  function sync() { showRoute(currentRoute()); }
  window.addEventListener('hashchange', sync);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sync);
  } else {
    sync();
  }
})();