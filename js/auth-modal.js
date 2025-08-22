
window.API = window.API || "http://localhost:8080";

async function renderAuthHeader(){
  const area=document.getElementById('authArea'); if(!area) return;
  area.innerHTML='';
  try{
    const me=await fetch(API+'/auth/me',{credentials:'include'}).then(r=>r.json());
    if(me.user){
      const span=document.createElement('span'); span.textContent=me.user.email; span.style.opacity='.85'; span.style.marginRight='10px';
      const out=document.createElement('button'); out.className='btn'; out.textContent='Logout';
      out.onclick=async()=>{ await fetch(API+'/auth/logout',{method:'POST',credentials:'include'}); location.reload(); };
      area.append(span,out);
    }else{
      const login=document.createElement('button'); login.className='btn'; login.textContent='Log In'; login.onclick=()=>TMAuth.open('login');
      const reg=document.createElement('button'); reg.className='btn primary'; reg.textContent='Register'; reg.onclick=()=>TMAuth.open('register');
      area.append(login,reg);
    }
  }catch(e){ console.error(e); }
}
document.addEventListener('DOMContentLoaded', renderAuthHeader);

const TMAuth={el:null,tab:'login',code:'',
  mount(){ if(this.el) return;
    const div=document.createElement('div'); div.id='tmAuthOverlay'; div.className='tm-overlay';
    div.innerHTML=`
      <div class="tm-modal" role="dialog" aria-modal="true">
        <div class="tm-head"><div class="tm-title">Account</div><button class="tm-close">×</button></div>
        <div class="tm-tabs"><div id="tmTabLogin" class="tm-tab active">Log in</div><div id="tmTabReg" class="tm-tab">Register</div></div>
        <div class="tm-body">
          <form id="tmLogin">
            <input id="tmLEmail" class="tm-input" type="email" placeholder="Email" required />
            <input id="tmLPass" class="tm-input" type="password" placeholder="Password" required />
            <div class="tm-row"><button class="tm-btn primary" type="submit">Log in</button><span id="tmLMsg" class="tm-note"></span><span class="tm-right"></span><button class="tm-btn" type="button" id="tmToReg">Need an account?</button></div>
          </form>
          <form id="tmReg" style="display:none">
            <input id="tmREmail" class="tm-input" type="email" placeholder="Email" required />
            <input id="tmRPass" class="tm-input" type="password" placeholder="Password (min 8)" required />
            <input id="tmRRe" class="tm-input" type="password" placeholder="Re-type password" required />
            <input id="tmRRef" class="tm-input" type="text" placeholder="Referral (optional)" />
            <div class="tm-row"><button class="tm-btn" type="button" id="tmSendCode">Send Code</button><input id="tmRCode" class="tm-input" style="flex:1" minlength="6" maxlength="6" placeholder="Enter 6-digit code"/></div>
            <div class="tm-row"><button class="tm-btn primary" type="submit">Create account</button><span id="tmRMsg" class="tm-note"></span><span class="tm-right"></span><button class="tm-btn" type="button" id="tmToLogin">I have an account</button></div>
          </form>
        </div>
      </div>`;
    document.body.appendChild(div); this.el=div;
    div.querySelector('.tm-close').onclick=()=>this.close();
    document.getElementById('tmTabLogin').onclick=()=>this.switch('login');
    document.getElementById('tmTabReg').onclick=()=>this.switch('register');
    document.getElementById('tmToReg').onclick=()=>this.switch('register');
    document.getElementById('tmToLogin').onclick=()=>this.switch('login');
    div.addEventListener('click',(e)=>{ if(e.target===div) this.close(); });
    document.getElementById('tmLogin').addEventListener('submit', this.submitLogin.bind(this));
    document.getElementById('tmReg').addEventListener('submit', this.submitRegister.bind(this));
    document.getElementById('tmSendCode').addEventListener('click', this.sendCode.bind(this));
  },
  open(tab){ this.mount(); this.switch(tab||'login'); this.el.classList.add('show'); },
  close(){ this.el?.classList.remove('show'); },
  switch(tab){ this.tab=tab; const log=tmLogin, reg=tmReg, tl=tmTabLogin, tr=tmTabReg;
    if(tab==='login'){ log.style.display='block'; reg.style.display='none'; tl.classList.add('active'); tr.classList.remove('active'); }
    else{ reg.style.display='block'; log.style.display='none'; tr.classList.add('active'); tl.classList.remove('active'); }
  },
  async submitLogin(e){ e.preventDefault(); tmLMsg.textContent='Logging in…';
    try{ const r=await fetch(API+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({email:tmLEmail.value.trim(),password:tmLPass.value})}).then(r=>r.json());
      if(r.ok){ tmLMsg.textContent='Success'; this.close(); renderAuthHeader(); } else tmLMsg.textContent=r.error||'Login failed';
    }catch{ tmLMsg.textContent='Network error'; } },
  async sendCode(){ tmRMsg.textContent='Sending code…';
    try{ const r=await fetch(API+'/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:tmREmail.value.trim(),password:tmRPass.value,referral:tmRRef.value.trim()||null})}).then(r=>r.json());
      if(r.ok){ this.code=r.demo_code||''; tmRMsg.textContent='Code sent (demo): '+this.code; } else tmRMsg.textContent=r.error||'Failed';
    }catch{ tmRMsg.textContent='Network error'; } },
  async submitRegister(e){ e.preventDefault();
    if(tmRPass.value!==tmRRe.value){ tmRMsg.textContent='Passwords do not match.'; return; }
    if(!tmRCode.value||tmRCode.value.length!==6){ tmRMsg.textContent='Enter 6-digit code.'; return; }
    tmRMsg.textContent='Verifying…';
    try{ const v=await fetch(API+'/auth/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:tmREmail.value.trim(),code:tmRCode.value.trim()})}).then(r=>r.json());
      if(!v.ok){ tmRMsg.textContent=v.error||'Invalid code'; return; }
      const l=await fetch(API+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({email:tmREmail.value.trim(),password:tmRPass.value})}).then(r=>r.json());
      if(l.ok){ tmRMsg.textContent='Account created.'; this.close(); renderAuthHeader(); } else tmRMsg.textContent=l.error||'Login failed';
    }catch{ tmRMsg.textContent='Network error'; } }
};
</script>
