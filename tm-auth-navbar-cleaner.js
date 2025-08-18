/* tm-auth-navbar-cleaner.js
   Clean version: ensures #authArea exists, without old login/register references.
*/
(function(){
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
    ensureAuthArea(nav);
    if (window.TMAuth && window.TMAuthHeaderRender) {
      window.TMAuthHeaderRender();
    }
  });
})();
