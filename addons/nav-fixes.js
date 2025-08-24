/**
 * addons/nav-fixes.js
 * Makes the bottom nav tabs fully clickable and routes to #home/#assets/#strategy/#team/#mine.
 * It toggles view panels with ids: view-home, view-assets, view-strategy, view-team, view-mine.
 */
(function () {
  const routes = ['home', 'assets', 'strategy', 'team', 'mine'];

  function showRoute(route) {
    routes.forEach(r => {
      const panel = document.getElementById('view-' + r);
      if (panel) {
        panel.style.display = (r === route) ? '' : 'none';
        panel.classList.toggle('active', r === route);
      }
    });
    document.querySelectorAll('#bottomTabs .tab').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-route') === '#' + route);
    });
  }

  function currentRoute() {
    const h = (window.location.hash || '#home').replace('#', '');
    return routes.includes(h) ? h : 'home';
  }

  document.addEventListener('click', (e) => {
    const tab = e.target.closest('#bottomTabs .tab[data-route]');
    if (!tab) return;
    e.preventDefault();
    const to = tab.getAttribute('data-route');
    if (!to) return;
    if (window.location.hash !== to) window.location.hash = to;
    else showRoute(to.replace('#',''));
  });

  function sync() { showRoute(currentRoute()); }
  window.addEventListener('hashchange', sync);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync);
  else sync();
})();
