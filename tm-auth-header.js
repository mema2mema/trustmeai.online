/* tm-auth-header.js — tiny navbar UI renderer for TMAuth
   Usage: place <div id="authArea"></div> in your header, then include this file (after tm-auth.js)
*/
(function(){
  function render(){
    var mount = document.getElementById('authArea');
    if(!mount) return; // nothing to do
    mount.innerHTML = '';
    var a = (window.TMAuth && TMAuth.auth && TMAuth.auth()) || null;
    if(a){
      var span = document.createElement('span');
      span.className = 'auth-email';
      span.style.marginRight='10px';
      span.style.opacity='.85';
      span.textContent = a.email;
      var btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = 'Logout';
      btn.onclick = function(){ TMAuth.logout(); };
      mount.appendChild(span);
      mount.appendChild(btn);
    }else{
      var login = document.createElement('a');
      login.href = '/login.html';
      login.className = 'btn-ghost';
      login.textContent = 'Log In';
      var reg = document.createElement('a');
      reg.href = '/register.html';
      reg.className = 'btn';
      reg.style.marginLeft='8px';
      reg.textContent = 'Register';
      mount.appendChild(login);
      mount.appendChild(reg);
    }
  }
  document.addEventListener('DOMContentLoaded', render);
})();