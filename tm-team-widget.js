
// tm-team-widget.js — drop-in Team & Referral widget
(function(){
  function injectScript(src, cb){
    var s = document.createElement('script'); s.src = src; s.onload = cb||function(){}; document.head.appendChild(s);
  }
  function toast(msg){
    var t = document.getElementById("tm_toast");
    if(!t){
      t = document.createElement('div');
      t.id = "tm_toast";
      t.style.cssText = "visibility:hidden;min-width:220px;margin-left:-110px;background:#111;color:#fff;text-align:center;border-radius:10px;padding:10px 12px;position:fixed;z-index:9999;left:50%;bottom:28px;font-size:14px;opacity:0;transition:opacity .35s,bottom .35s,visibility .35s";
      document.body.appendChild(t);
    }
    t.textContent = msg||"Copied!";
    t.style.visibility = "visible"; t.style.opacity = "1"; t.style.bottom = "46px";
    setTimeout(function(){ t.style.opacity="0"; t.style.bottom="28px"; t.style.visibility="hidden"; }, 1800);
  }
  function countUp(el, target, ms){
    var t0 = 0, steps = Math.max(20, Math.min(80, Math.floor(ms/20)));
    var step = target/steps, i=0;
    var it = setInterval(function(){
      i++; t0 += step;
      if(i>=steps){ t0 = target; clearInterval(it); }
      el.textContent = String(Math.floor(t0));
    }, 20);
  }
  function ensureInviteData(){
    var me = localStorage.getItem('tmInviteCode');
    if(!me){
      me = "TM" + Math.random().toString(36).slice(2,8).toUpperCase();
      localStorage.setItem('tmInviteCode', me);
    }
    var base = location.origin + (location.pathname.endsWith('/') ? location.pathname : location.pathname.replace(/\/[^\/]*$/, '/'));
    var link = base + "index.html?ref=" + encodeURIComponent(me);
    if (localStorage.getItem("tmRefBy")) link += "&u2=" + encodeURIComponent(localStorage.getItem("tmRefBy"));
    return {me, link};
  }
  function build(){
    var host = document.getElementById('tm-team-widget');
    if(!host){
      host = document.createElement('section'); host.id = 'tm-team-widget';
      host.style.margin = "24px auto"; host.style.maxWidth = "900px";
      // try to place beneath h1 or after first main/section
      var anchor = document.querySelector('main,section,.container,.section') || document.body;
      anchor.insertBefore(host, anchor.firstChild);
    }
    var data = ensureInviteData();

    host.innerHTML = ''
      + '<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:16px;">'
      + '  <h2 style="margin:0 0 8px;font-size:24px;font-weight:800">My Team & Referrals</h2>'
      + '  <div style="height:4px;background:linear-gradient(90deg,#22c55e,#0ea5e9);border-radius:999px;margin:6px 0 14px;"></div>'
      + '  <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin:8px 0 6px;">'
      + '    <div style="font-weight:700;opacity:.9">My Invite Code:</div>'
      + '    <input id="tm_invite_code" readonly style="flex:0 1 180px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:#fff;padding:.5rem .6rem;border-radius:8px">'
      + '    <button id="tm_copy_code" class="tm-btn">Copy Code</button>'
      + '  </div>'
      + '  <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:6px 0;">'
      + '    <input id="tm_invite_link" readonly style="flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:#fff;padding:.6rem .7rem;border-radius:8px">'
      + '    <button id="tm_copy_link" class="tm-btn">Copy Link</button>'
      + '  </div>'
      + '  <div class="tm-share" style="display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 10px;">'
      + '    <button class="tm-btn" id="tm_share_wa">Share WhatsApp</button>'
      + '    <button class="tm-btn" id="tm_share_tg">Share Telegram</button>'
      + '    <button class="tm-btn" id="tm_share_tw">Share X</button>'
      + '    <button class="tm-btn" id="tm_share_fb">Share Facebook</button>'
      + '    <div class="tm-qr" style="display:flex;align-items:center;gap:10px;margin-left:auto;">'
      + '      <div class="small" style="opacity:.85">QR</div>'
      + '      <div id="tm_invite_qr" style="padding:6px;background:rgba(255,255,255,.06);border-radius:8px"></div>'
      + '    </div>'
      + '  </div>'
      + '  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:10px 0;">'
      + '    <div class="tm-card"><div class="tm-label">Level 1</div><div id="tm_l1" class="tm-val">0</div></div>'
      + '    <div class="tm-card"><div class="tm-label">Level 2</div><div id="tm_l2" class="tm-val">0</div></div>'
      + '    <div class="tm-card"><div class="tm-label">Team Total</div><div id="tm_total" class="tm-val">0</div></div>'
      + '    <div class="tm-card"><div class="tm-label">Commissions</div><div id="tm_comm" class="tm-val">0.00 USDT</div></div>'
      + '  </div>'
      + '  <div id="tm_badges" style="margin:6px 0 0"></div>'
      + '  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">'
      + '    <div style="font-weight:700;opacity:.9">Recent Team Earnings</div>'
      + '    <button id="tm_export" class="tm-btn">Export CSV</button>'
      + '  </div>'
      + '  <table class="tm-table" style="width:100%;border-collapse:collapse;margin-top:6px;">'
      + '    <thead><tr><th>Time</th><th>Level</th><th>Deposit</th><th>Commission</th></tr></thead>'
      + '    <tbody id="tm_earn_tbody"><tr><td colspan="4" style="opacity:.7">No records yet</td></tr></tbody>'
      + '  </table>'
      + '</div>';

    // Minimal CSS
    var css = document.getElementById('tm_widget_css');
    if(!css){
      css = document.createElement('style'); css.id = 'tm_widget_css';
      css.textContent = ".tm-btn{background:#1f2937;border:1px solid rgba(255,255,255,.12);color:#fff;border-radius:8px;padding:.5rem .7rem;cursor:pointer}"
        + ".tm-btn:active{transform:translateY(1px)}"
        + ".tm-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);padding:.6rem .7rem;border-radius:10px}"
        + ".tm-label{font-size:.8rem;opacity:.8}"
        + ".tm-val{font-size:1.2rem;font-weight:800}"
        + ".tm-table th,.tm-table td{border-bottom:1px solid rgba(255,255,255,.08);padding:.45rem .5rem;text-align:left}";
      document.head.appendChild(css);
    }

    // Data populate
    var codeEl = document.getElementById('tm_invite_code');
    var linkEl = document.getElementById('tm_invite_link');
    codeEl.value = data.me; linkEl.value = data.link;

    // QR (load qrcode.min.js if missing)
    function makeQR(){
      try{
        var qrEl = document.getElementById('tm_invite_qr'); qrEl.innerHTML="";
        new QRCode(qrEl, {text: data.link, width: 110, height: 110, correctLevel: QRCode.CorrectLevel.H});
      }catch(e){ console.warn('QR failed', e); }
    }
    if (window.QRCode) makeQR(); else injectScript('qrcode.min.js', makeQR);

    // Counters & badge
    var l1 = parseInt(localStorage.getItem('countL1_'+data.me) || localStorage.getItem('tmRefL1') || '0', 10);
    var l2 = parseInt(localStorage.getItem('countL2_'+data.me) || localStorage.getItem('tmRefL2') || '0', 10);
    var comm = parseFloat(localStorage.getItem('comm_'+data.me) || '0');
    countUp(document.getElementById('tm_l1'), l1, 600);
    countUp(document.getElementById('tm_l2'), l2, 600);
    countUp(document.getElementById('tm_total'), l1+l2, 700);
    document.getElementById('tm_comm').textContent = comm.toFixed(2) + " USDT";
    var badgeHost = document.getElementById('tm_badges');
    var badge = (comm >= 1000 || (l1+l2)>=200) ? "🔥 Master"
              : (comm >= 200 || (l1+l2)>=50)   ? "🚀 Pro"
              : (comm >= 50  || (l1+l2)>=10)   ? "🎯 Rookie"
              : "✨ New";
    badgeHost.innerHTML = '<span style="padding:.25rem .6rem;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12)">'+badge+'</span>';

    // Earnings table
    var key = 'refLogs_' + data.me;
    var rows = []; try{ rows = JSON.parse(localStorage.getItem(key)||'[]') }catch(e){ rows=[] }
    var tb = document.getElementById('tm_earn_tbody'); tb.innerHTML = "";
    if(!rows.length) tb.innerHTML = '<tr><td colspan="4" style="opacity:.7">No records yet</td></tr>';
    rows.slice(-10).reverse().forEach(function(r){
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>'+(r.time||'')+'</td><td>'+(r.level||'')+'</td><td>'+Number(r.amount||0).toFixed(2)+'</td><td>'+Number(r.commission||0).toFixed(2)+'</td>';
      tb.appendChild(tr);
    });

    // Copy
    document.getElementById('tm_copy_link').onclick = function(){
      linkEl.select(); linkEl.setSelectionRange(0, 99999); document.execCommand('copy'); toast('Invite link copied');
    };
    document.getElementById('tm_copy_code').onclick = function(){
      codeEl.select(); codeEl.setSelectionRange(0, 99999); document.execCommand('copy'); toast('Invite code copied');
    };

    // Share
    function shareText(){ return 'Join me on TrustMe AI 🚀 Earn with me 👉 ' + data.link; }
    document.getElementById('tm_share_wa').onclick = function(){ window.open('https://wa.me/?text=' + encodeURIComponent(shareText()), '_blank'); };
    document.getElementById('tm_share_tg').onclick = function(){ window.open('https://t.me/share/url?url=' + encodeURIComponent(data.link) + '&text=' + encodeURIComponent(shareText()), '_blank'); };
    document.getElementById('tm_share_tw').onclick = function(){ window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText()), '_blank'); };
    document.getElementById('tm_share_fb').onclick = function(){ window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(data.link), '_blank'); };

    // Export
    document.getElementById('tm_export').onclick = function(){
      try {
        var csv = 'Time,Level,Deposit,Commission\n';
        rows.forEach(function(r){ csv += [r.time, r.level, r.amount, r.commission].join(',') + '\n'; });
        var blob = new Blob([csv], {type:'text/csv'});
        var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'team_earnings.csv'; a.click();
      } catch(e){ console.error(e); }
    };
  }

  if (document.readyState === "loading") document.addEventListener('DOMContentLoaded', build);
  else build();
})();
