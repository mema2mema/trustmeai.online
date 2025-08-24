(function () {
  const routes = ['home', 'assets', 'strategy', 'team', 'mine'];
  function showRoute(route) {
    routes.forEach(r => {
      const panel = document.getElementById('view-' + r);
      if (panel) panel.style.display = (r === route) ? '' : 'none';
    });
    document.querySelectorAll('[data-route]').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-route') === '#' + route);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function currentRoute() {
    const h = (window.location.hash || '#home').slice(1);
    return routes.includes(h) ? h : 'home';
  }
  document.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-route]');
    if (!tab) return;
    e.preventDefault();
    const to = tab.getAttribute('data-route');
    if (to) window.location.hash = to;
  });
  const sync = () => showRoute(currentRoute());
  window.addEventListener('hashchange', sync);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync);
  else sync();
})();
