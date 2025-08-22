// Classic Auth (non-intrusive)
// 1) Make sure you have <div id="authArea"></div> in your header/nav
// 2) Ensure window.API is set to your backend origin
window.API = window.API || "http://localhost:8080";

document.addEventListener('DOMContentLoaded', initAuthClassic);

async function initAuthClassic(){
  const host = document.getElementById('authArea');
  if(!host) return;

  // build pills
  host.innerHTML = `
    <button class="auth-pill" id="pillLogin">Login</button>
    <button class="auth-pill primary" id="pillRegister">Register</button>
  `;

  // create modal container once
  const overlay = document.createElement('div');
  overlay.id = 'authOverlay';
  overlay.className = 'auth-overlay';
  overlay.innerHTML = `
    <div class="auth-card" role="dialog" aria-modal="true">
      <div class="auth-head">
        <div class="auth-tabs">
          <div class="auth-tab active" id="tabLogin">Log in</div>
          <div class="auth-tab" id="tabReg">Register</div>
        </div>
        <button class="auth-close" id="authClose">×</button>
      </div>
      <div class="auth-body">
        <form id="frmLogin">
          <input class="auth-input" id="Lemail" type="email" placeholder="Email" required>
          <input class="auth-input" id="Lpass" type="password" placeholder="Password" required>
          <button class="auth-btn primary" type="submit">Log in</button>
          <div class="auth-note" id="Lmsg"></div>
        </form>
        <form id="frmReg" style="display:none">
          <input class="auth-input" id="Remail" type="email" placeholder="Email" required>
          <input class="auth-input" id="Rpass" type="password" placeholder="Password" required>
          <input class="auth-input" id="Rre" type="password" placeholder="Re-type Password" required>
          <div style="display:flex;gap:.5rem;align-items:center">
            <button class="auth-btn" type="button" id="SendCode">Send Code</button>
            <input class="auth-input" style="flex:1" id="Rcode" placeholder="6-digit code" maxlength="6">
          </div>
          <input class="auth-input" id="Rref" placeholder="Referral (optional)">
          <button class="auth-btn primary" type="submit">Create account</button>
          <div class="auth-note" id="Rmsg"></div>
        </form>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // show/hide helpers
  const show = ()=> overlay.classList.add('show');
  const hide = ()=> overlay.classList.remove('show');
  document.getElementById('authClose').onclick = hide;
  overlay.addEventListener('click', e=>{ if(e.target===overlay) hide(); });

  // tab logic
  const tabLogin = document.getElementById('tabLogin');
  const tabReg = document.getElementById('tabReg');
  const frmLogin = document.getElementById('frmLogin');
  const frmReg = document.getElementById('frmReg');
  function setTab(which){
    const l = which==='login';
    tabLogin.classList.toggle('active', l);
    tabReg.classList.toggle('active', !l);
    frmLogin.style.display = l ? 'block' : 'none';
    frmReg.style.display = l ? 'none' : 'block';
  }
  tabLogin.onclick = ()=> setTab('login');
  tabReg.onclick = ()=> setTab('register');

  // pills open modal
  document.getElementById('pillLogin').onclick = ()=>{ setTab('login'); show(); };
  document.getElementById('pillRegister').onclick = ()=>{ setTab('register'); show(); };

  // if already logged in, swap pills for email+logout (lightweight check)
  try{
    const me = await fetch(API+'/auth/me',{credentials:'include'}).then(r=>r.json());
    if(me.user){
      host.innerHTML = `<span style="opacity:.85;margin-right:8px">${me.user.email}</span>
                        <button class="auth-pill" id="pillOut">Logout</button>`;
      document.getElementById('pillOut').onclick = async()=>{
        await fetch(API+'/auth/logout',{method:'POST',credentials:'include'});
        location.reload();
      };
      return;
    }
  }catch(_){}

  // submit handlers
  frmLogin.addEventListener('submit', async (e)=>{
    e.preventDefault();
    Lmsg.textContent = 'Logging in…';
    try{
      const r = await fetch(API+'/auth/login',{
        method:'POST',headers:{'Content-Type':'application/json'},
        credentials:'include',
        body: JSON.stringify({email:Lemail.value.trim(), password:Lpass.value})
      }).then(r=>r.json());
      if(r.ok){ location.reload(); } else { Lmsg.textContent = r.error||'Login failed'; }
    }catch{ Lmsg.textContent = 'Network error'; }
  });

  document.getElementById('SendCode').addEventListener('click', async ()=>{
    Rmsg.textContent='Sending code…';
    if(Rpass.value !== Rre.value){ Rmsg.textContent='Passwords do not match.'; return; }
    try{
      const r = await fetch(API+'/auth/register',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body: JSON.stringify({email:Remail.value.trim(), password:Rpass.value, referral:Rref.value.trim()||null})
      }).then(r=>r.json());
      if(r.ok){ Rmsg.textContent='Code sent (check demo / email).'; } else { Rmsg.textContent=r.error||'Failed'; }
    }catch{ Rmsg.textContent='Network error'; }
  });

  frmReg.addEventListener('submit', async (e)=>{
    e.preventDefault();
    Rmsg.textContent='Verifying…';
    if(Rpass.value !== Rre.value){ Rmsg.textContent='Passwords do not match.'; return; }
    try{
      const v = await fetch(API+'/auth/verify',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body: JSON.stringify({email:Remail.value.trim(), code:Rcode.value.trim()})
      }).then(r=>r.json());
      if(!v.ok){ Rmsg.textContent=v.error||'Invalid code'; return; }
      const l = await fetch(API+'/auth/login',{
        method:'POST',headers:{'Content-Type':'application/json'},
        credentials:'include',
        body: JSON.stringify({email:Remail.value.trim(), password:Rpass.value})
      }).then(r=>r.json());
      if(l.ok){ location.reload(); } else { Rmsg.textContent=l.error||'Login failed'; }
    }catch{ Rmsg.textContent='Network error'; }
  });
}