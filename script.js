// ===== Auth Core (localStorage demo) =====
function tm_ls_get(k, def){ try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(def))}catch(e){return def} }
function tm_ls_set(k, v){ try{localStorage.setItem(k, JSON.stringify(v))}catch(e){} }

async function tm_hash(t){
  if(crypto && crypto.subtle){
    const enc=new TextEncoder().encode(t);
    const h=await crypto.subtle.digest('SHA-256',enc);
    return Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  try{return btoa(t)}catch(e){return t}
}

async function tm_register({email,pass,ref}){
  const users=tm_ls_get('tm_users',[]);
  if(users.find(u=>u.email===email)) return false;
  const hash=await tm_hash(pass);
  users.push({email,pass:hash,ref:ref||null,created:Date.now()});
  tm_ls_set('tm_users', users);
  tm_ls_set('tm_auth',{email});
  return true;
}

async function tm_login(email,pass){
  const users=tm_ls_get('tm_users',[]);
  const hash=await tm_hash(pass);
  const u=users.find(u=>u.email===email && u.pass===hash);
  if(!u) return false;
  tm_ls_set('tm_auth',{email:u.email});
  return true;
}

function tm_auth(){ return tm_ls_get('tm_auth',null); }
function tm_logout(){ localStorage.removeItem('tm_auth'); location.reload(); }

function tm_renderAuth(){
  const area=document.getElementById('authArea'); if(!area) return;
  area.innerHTML='';
  const a=tm_auth();
  if(a){
    const out=document.createElement('button');
    out.className='btn';
    out.textContent='Logout';
    out.onclick=tm_logout;
    area.appendChild(out);
  }else{
    const here=(location.pathname.split('/').pop()||'index.html');
    const login=document.createElement('a'); login.href='login.html?next='+encodeURIComponent(here); login.className='btn-ghost'; login.textContent='Login';
    const reg=document.createElement('a'); reg.href='register.html?next='+encodeURIComponent(here); reg.className='btn'; reg.textContent='Register';
    area.appendChild(login); area.appendChild(reg);
  }
}
document.addEventListener('DOMContentLoaded', tm_renderAuth);

// Fallback ghost style (in case)
(function(){const s=document.createElement('style'); s.textContent='.btn-ghost{padding:.45rem .8rem;border-radius:12px;border:1px solid var(--stroke);background:transparent;color:var(--text);text-decoration:none}.btn-ghost:hover{background:rgba(255,255,255,.06)}'; document.head.appendChild(s);} )();