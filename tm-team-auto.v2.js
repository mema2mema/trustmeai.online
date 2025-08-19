
/*! tm-team-auto.v2.js — refined layout */
(function(){
  function injectCSS(){
    if (document.getElementById('tm_team_v2_css')) return;
    var s=document.createElement('style'); s.id='tm_team_v2_css';
    s.textContent = `
    .tmv2-wrap{max-width:1100px;margin:28px auto;padding:0 16px}
    .tmv2-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.25);overflow:hidden}
    .tmv2-head{padding:16px 18px 8px}
    .tmv2-title{font-family:Poppins,Inter,sans-serif;font-weight:800;font-size:26px;margin:0}
    .tmv2-bar{height:6px;background:linear-gradient(90deg,#22c55e,#0ea5e9);border-radius:999px;margin:8px 0 12px;opacity:.9}
    .tmv2-body{display:grid;grid-template-columns:1.2fr .8fr;gap:14px;padding:12px 18px 18px}
    .tmv2-left .row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:8px 0}
    .tmv2-input{flex:1;min-width:260px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:#fff;padding:.65rem .75rem;border-radius:10px}
    .tmv2-btn{background:#1f2937;border:1px solid rgba(255,255,255,.12);color:#fff;border-radius:10px;padding:.55rem .75rem;cursor:pointer}
    .tmv2-btn:active{transform:translateY(1px)}
    .tmv2-share{display:flex;gap:8px;flex-wrap:wrap}
    .tmv2-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:8px 0}
    .tmv2-kpi{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);padding:.75rem .9rem;border-radius:12px}
    .tmv2-kpi .lab{font-size:.8rem;opacity:.8}
    .tmv2-kpi .val{font-size:1.25rem;font-weight:800}
    .tmv2-badges{margin:6px 0 4px}
    .tmv2-badge{padding:.3rem .7rem;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);font-size:.9rem}
    .tmv2-right{display:flex;align-items:center;justify-content:center}
    .tmv2-qrwrap{display:flex;flex-direction:column;align-items:center;gap:8px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px}
    .tmv2-qrwrap .lab{font-size:.85rem;opacity:.85}
    .tmv2-table{width:100%;border-collapse:collapse;margin-top:10px}
    .tmv2-table th,.tmv2-table td{border-bottom:1px solid rgba(255,255,255,.08);padding:.55rem .6rem;text-align:left;font-size:.95rem}
    .tmv2-table th{opacity:.85}
    .tmv2-foot{display:flex;justify-content:space-between;align-items:center;margin-top:12px}
    #tmv2_toast{visibility:hidden;min-width:220px;margin-left:-110px;background:#111;color:#fff;text-align:center;border-radius:10px;padding:10px 12px;position:fixed;z-index:9999;left:50%;bottom:28px;font-size:14px;opacity:0;transition:opacity .35s,bottom .35s,visibility .35s}
    #tmv2_toast.show{visibility:visible;opacity:1;bottom:46px}
    @media(max-width:980px){ .tmv2-body{grid-template-columns:1fr}.tmv2-right{justify-content:flex-start} }
    @media(max-width:520px){ .tmv2-kpis{grid-template-columns:repeat(2,1fr)} }
    `;
    document.head.appendChild(s);
  }
  function toast(msg){
    var t=document.getElementById('tmv2_toast'); if(!t){ t=document.createElement('div'); t.id='tmv2_toast'; document.body.appendChild(t); }
    t.textContent = msg||'Copied!';
    t.className='show'; setTimeout(function(){ t.className=''; }, 1800);
  }
  function countUp(el, target, ms){
    var t0=0, steps=Math.max(20, Math.min(80, Math.floor(ms/20))), step=target/steps, i=0;
    var it=setInterval(function(){ i++; t0+=step; if(i>=steps){ t0=target; clearInterval(it); } el.textContent=String(Math.floor(t0)); },20);
  }
  function ensureInviteData(){
    var me=localStorage.getItem('tmInviteCode');
    if(!me){ me = "TM" + Math.random().toString(36).slice(2,8).toUpperCase(); localStorage.setItem('tmInviteCode',me); }
    var base = location.origin + (location.pathname.endsWith('/')?location.pathname:location.pathname.replace(/\/[^\/]*$/,'/'));
    var link = base + "index.html?ref=" + encodeURIComponent(me);
    if(localStorage.getItem('tmRefBy')) link += "&u2=" + encodeURIComponent(localStorage.getItem('tmRefBy'));
    return {me, link};
  }
  function injectScript(src, cb){ var s=document.createElement('script'); s.src=src; s.onload=cb||function(){}; document.head.appendChild(s); }
  function build(){
    injectCSS();
    var anchor = document.querySelector('main, .container, .section, section') || document.body;
    var wrap = document.createElement('div'); wrap.className='tmv2-wrap';
    var card = document.createElement('div'); card.className='tmv2-card'; wrap.appendChild(card);
    anchor.insertBefore(wrap, anchor.firstChild);
    card.innerHTML = `
      <div class="tmv2-head">
        <h2 class="tmv2-title">My Team & Referrals</h2>
        <div class="tmv2-bar"></div>
      </div>
      <div class="tmv2-body">
        <div class="tmv2-left">
          <div class="row"><div style="font-weight:700;opacity:.9">My Invite Code:</div><input id="tmv2_code" class="tmv2-input" readonly><button id="tmv2_copy_code" class="tmv2-btn">Copy Code</button></div>
          <div class="row"><input id="tmv2_link" class="tmv2-input" readonly><button id="tmv2_copy_link" class="tmv2-btn">Copy Link</button></div>
          <div class="tmv2-share row">
            <button class="tmv2-btn" id="tmv2_wa">Share WhatsApp</button>
            <button class="tmv2-btn" id="tmv2_tg">Share Telegram</button>
            <button class="tmv2-btn" id="tmv2_tw">Share X</button>
            <button class="tmv2-btn" id="tmv2_fb">Share Facebook</button>
          </div>
          <div class="tmv2-kpis">
            <div class="tmv2-kpi"><div class="lab">Level 1</div><div id="tmv2_l1" class="val">0</div></div>
            <div class="tmv2-kpi"><div class="lab">Level 2</div><div id="tmv2_l2" class="val">0</div></div>
            <div class="tmv2-kpi"><div class="lab">Team Total</div><div id="tmv2_total" class="val">0</div></div>
            <div class="tmv2-kpi"><div class="lab">Commissions</div><div id="tmv2_comm" class="val">0.00 USDT</div></div>
          </div>
          <div class="tmv2-badges" id="tmv2_badges"></div>
          <div class="tmv2-foot"><div style="font-weight:700;opacity:.9">Recent Team Earnings</div><button id="tmv2_export" class="tmv2-btn">Export CSV</button></div>
          <table class="tmv2-table"><thead><tr><th>Time</th><th>Level</th><th>Deposit</th><th>Commission</th></tr></thead><tbody id="tmv2_tbody"><tr><td colspan="4" style="opacity:.7">No records yet</td></tr></tbody></table>
        </div>
        <div class="tmv2-right">
          <div class="tmv2-qrwrap"><div class="lab">QR</div><div id="tmv2_qr"></div></div>
        </div>
      </div>
    `;
    var data = (function(){ var d=ensureInviteData(); document.getElementById('tmv2_code').value=d.me; document.getElementById('tmv2_link').value=d.link; return d; })();
    function makeQR(){ try{ var el=document.getElementById('tmv2_qr'); el.innerHTML=''; new QRCode(el,{text:data.link,width:120,height:120,correctLevel:QRCode.CorrectLevel.H}); }catch(e){} }
    if (window.QRCode) makeQR(); else injectScript('qrcode.min.js', makeQR);
    // counters & badge
    var l1=parseInt(localStorage.getItem('countL1_'+data.me) || localStorage.getItem('tmRefL1') || '0',10);
    var l2=parseInt(localStorage.getItem('countL2_'+data.me) || localStorage.getItem('tmRefL2') || '0',10);
    var comm=parseFloat(localStorage.getItem('comm_'+data.me) || '0');
    countUp(document.getElementById('tmv2_l1'), l1, 600);
    countUp(document.getElementById('tmv2_l2'), l2, 600);
    countUp(document.getElementById('tmv2_total'), l1+l2, 700);
    document.getElementById('tmv2_comm').textContent = comm.toFixed(2) + ' USDT';
    var badge = (comm >= 1000 || (l1+l2)>=200) ? "🔥 Master" : (comm >= 200 || (l1+l2)>=50) ? "🚀 Pro" : (comm >= 50 || (l1+l2)>=10) ? "🎯 Rookie" : "✨ New";
    document.getElementById('tmv2_badges').innerHTML = '<span class="tmv2-badge">'+badge+'</span>';
    // earnings table
    var key='refLogs_'+data.me, rows=[]; try{ rows=JSON.parse(localStorage.getItem(key)||'[]'); }catch(e){ rows=[] }
    var tb=document.getElementById('tmv2_tbody'); tb.innerHTML = rows.length? '' : '<tr><td colspan="4" style="opacity:.7">No records yet</td></tr>';
    rows.slice(-10).reverse().forEach(function(r){ var tr=document.createElement('tr'); tr.innerHTML='<td>'+ (r.time||'') +'</td><td>'+ (r.level||'') +'</td><td>'+ Number(r.amount||0).toFixed(2) +'</td><td>'+ Number(r.commission||0).toFixed(2) +'</td>'; tb.appendChild(tr); });
    // copy + share + export
    document.getElementById('tmv2_copy_link').onclick=function(){ var el=document.getElementById('tmv2_link'); el.select(); el.setSelectionRange(0,99999); document.execCommand('copy'); toast('Invite link copied'); };
    document.getElementById('tmv2_copy_code').onclick=function(){ var el=document.getElementById('tmv2_code'); el.select(); el.setSelectionRange(0,99999); document.execCommand('copy'); toast('Invite code copied'); };
    function shareText(){ return 'Join me on TrustMe AI 🚀 Earn with me 👉 ' + data.link; }
    document.getElementById('tmv2_wa').onclick=function(){ window.open('https://wa.me/?text='+encodeURIComponent(shareText()),'_blank'); };
    document.getElementById('tmv2_tg').onclick=function(){ window.open('https://t.me/share/url?url='+encodeURIComponent(data.link)+'&text='+encodeURIComponent(shareText()),'_blank'); };
    document.getElementById('tmv2_tw').onclick=function(){ window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent(shareText()),'_blank'); };
    document.getElementById('tmv2_fb').onclick=function(){ window.open('https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(data.link),'_blank'); };
    document.getElementById('tmv2_export').onclick=function(){ try{ var csv='Time,Level,Deposit,Commission\n'; rows.forEach(function(r){ csv += [r.time,r.level,r.amount,r.commission].join(',') + '\n'; }); var blob=new Blob([csv],{type:'text/csv'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='team_earnings.csv'; a.click(); }catch(e){} };
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
