/* tm-auth-navbar-cleaner.js
   Removes old Login/Register buttons in your nav and injects #authArea automatically.
*/
(function(){
  function byText(nodeList, matcher){
    return Array.prototype.filter.call(nodeList, function(el){
      var t=(el.textContent||'').trim().toLowerCase();
      return matcher(t, el);
    });
  }
  function removeOldAuth(nav){
    if(!nav) return;
    // remove anchors/buttons that look like old auth
    var candidates = nav.querySelectorAll('a,button');
    byText(candidates, function(t,el){
      return t==='login' || t==='log in' || t==='register' || t==='sign up';
    }).forEach(function(el){ el.parentNode && el.parentNode.removeChild(el); });

    // also remove anchors pointing to "#" only
    Array.prototype.forEach.call(nav.querySelectorAll('a[href="#"]'), function(el){
      el.parentNode && el.parentNode.removeChild(el);
    });
  }
  function ensureAuthArea(nav){
    var mount = document.getElementById('authArea');
    if(!mount){
      mount = document.createElement('div');
      mount.id='authArea';
      mount.style.marginLeft='auto';
      nav && nav.appendChild(mount);
    }
  }
  document.addEventListener('DOMContentLoaded', function(){
    var nav = document.querySelector('nav, .nav, header nav');
    if(!nav) return;
    removeOldAuth(nav);
    ensureAuthArea(nav);
    // If header renderer already loaded, render now
    if (window.TMAuth && window.TMAuthHeaderRender) { window.TMAuthHeaderRender(); }
  });
})();