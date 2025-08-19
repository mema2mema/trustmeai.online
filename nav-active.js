// Active nav link highlighter + referral capture
(function(){
  // Highlight current nav item (exact match on filename)
  try {
    var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('nav a').forEach(function(a){
      var href = (a.getAttribute('href')||'').toLowerCase();
      if (href === here) a.classList.add('active');
    });
  } catch(e) {}

  // Referral capture: ?ref=CODE (first touch only)
  try {
    var url = new URL(location.href);
    var ref = url.searchParams.get('ref');
    if (ref && !localStorage.getItem('tmRefBy')) {
      localStorage.setItem('tmRefBy', ref);
      // Increment L1 counter (demo)
      var n = parseInt(localStorage.getItem('tmRefL1')||'0',10) + 1;
      localStorage.setItem('tmRefL1', String(n));
    }
  } catch(e) {}
})();