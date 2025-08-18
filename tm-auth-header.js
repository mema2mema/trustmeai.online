/* tm-auth-header.js — renders auth UI into #authArea */
(function(){
  function render(){
    var mount = document.getElementById('authArea');
    if(!mount) return;
    mount.innerHTML='';
    var a = (window.TMAuth && TMAuth.auth && TMAuth.auth()) || null;
    if(a){
      var span=document.createElement('span');
      span.className='auth-email';
      span.textContent=a.email;
      span.style.marginRight='10px';
      span.style.opacity='.85';
      var out=document.createElement('button');
      out.className='btn';
      out.textContent='Logout';
      out.onclick=function(){ TMAuth.logout(); };
      mount.appendChild(span); mount.appendChild(out);
    }
  }
  window.TMAuthHeaderRender = render; document.addEventListener('DOMContentLoaded', render);
})();