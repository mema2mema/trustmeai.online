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

  // Referral capture: ?ref=CODE (first touch only) and optional ?u2=L2 upline
  try {
    var url = new URL(location.href);
    var ref = url.searchParams.get('ref');
    var u2  = url.searchParams.get('u2');
    if (ref && !localStorage.getItem('tmRefBy')) {
      localStorage.setItem('tmRefBy', ref);
      if (u2 && !localStorage.getItem('tmRefBy2')) localStorage.setItem('tmRefBy2', u2);
      // Counters on inviter (global-simulated in localStorage)
      try {
        var k1 = 'countL1_' + ref;
        var c1 = parseInt(localStorage.getItem(k1)||'0',10) + 1;
        localStorage.setItem(k1, String(c1));
      } catch(e){}
    }
      localStorage.setItem('tmRefBy', ref);
      // Increment L1 counter (demo)
      var n = parseInt(localStorage.getItem('tmRefL1')||'0',10) + 1;
      localStorage.setItem('tmRefL1', String(n));
    }
  } catch(e) {}
})();