// account.js
(function(){
  function ensureDefaults(){
    const email = localStorage.getItem("tmUserEmail") || "";
    if (!localStorage.getItem("tmNickname") && email){
      localStorage.setItem("tmNickname", email.split("@")[0]);
    }
    if (!localStorage.getItem("tmMembership")){
      localStorage.setItem("tmMembership","T1");
    }
    if (!localStorage.getItem("tmAgentLevel")){
      localStorage.setItem("tmAgentLevel","0");
    }
    if (!localStorage.getItem("tmUID")){
      // simple 6-digit uid
      const uid = (Math.floor(Math.random()*900000)+100000).toString();
      localStorage.setItem("tmUID", uid);
    }
    if (!localStorage.getItem("tmInviteCode")){
      const code = Math.random().toString(36).slice(2,8).toUpperCase();
      localStorage.setItem("tmInviteCode", code);
    }
    if (!localStorage.getItem("tmRegTime")){
      localStorage.setItem("tmRegTime", Date.now().toString());
    }
  }

  function $id(id){ return document.getElementById(id); }

  function copyText(t){ return navigator.clipboard.writeText(t).catch(()=>Promise.resolve(alert(t))); }

  document.addEventListener("DOMContentLoaded", function(){
    const email = localStorage.getItem("tmUserEmail");
    if (!email){ window.openModal && openModal("loginModal"); return; }

    ensureDefaults();

    // Fill top card
    $id("acName").textContent   = localStorage.getItem("tmNickname") || email;
    $id("acUID").textContent    = localStorage.getItem("tmUID");
    $id("acInvite").textContent = localStorage.getItem("tmInviteCode");
    $id("acLevel").textContent  = localStorage.getItem("tmMembership") || "T1";
    $id("acAgent").textContent  = localStorage.getItem("tmAgentLevel") || "0";

    // Copy handlers
    $id("copyUID")?.addEventListener("click", ()=>copyText(localStorage.getItem("tmUID")));
    $id("copyInvite")?.addEventListener("click", ()=>copyText(localStorage.getItem("tmInviteCode")));

    // Invite Friends → copy referral URL
    $id("acInviteFriends")?.addEventListener("click", (e)=>{
      e.preventDefault();
      const link = location.origin + "/?ref=" + encodeURIComponent(localStorage.getItem("tmInviteCode"));
      copyText(link).then(()=>alert("Referral link copied!"));
    });

    // Agent Level (placeholder)
    $id("acAgentLevel")?.addEventListener("click", (e)=>{
      e.preventDefault();
      const cur = localStorage.getItem("tmAgentLevel") || "0";
      const v = prompt("Set Agent Level (0–10)", cur);
      if (v!==null && /^\d+$/.test(v)) {
        localStorage.setItem("tmAgentLevel", v);
        $id("acAgent").textContent = v;
      }
    });

    // Upgrade level (T1–T4)
    $id("acUpgradeBtn")?.addEventListener("click", ()=>{
      const cur = localStorage.getItem("tmMembership") || "T1";
      const next = prompt("Set Membership Level (T1, T2, T3, T4)", cur);
      if (next){
        const v = next.toUpperCase().trim();
        if (["T1","T2","T3","T4"].includes(v)){
          localStorage.setItem("tmMembership", v);
          $id("acLevel").textContent = v;
          alert("Membership updated to " + v);
        } else {
          alert("Invalid level. Use T1, T2, T3, or T4.");
        }
      }
    });

    // Clear cache (only app keys)
    $id("acClearCache")?.addEventListener("click", ()=>{
      ["tmUserEmail","tmNickname","tmMembership","tmAgentLevel","tmUID","tmInviteCode","tmRegTime","tmLastLogin","tmPhone"].forEach(k=>localStorage.removeItem(k));
      alert("Cleared local profile cache.");
      document.dispatchEvent(new CustomEvent("tm-auth-changed"));
      location.reload();
    });

    // Language / Support / Social placeholders
    $id("acLanguage")?.addEventListener("click", (e)=>{ e.preventDefault(); alert("Languages coming soon"); });
    $id("acSupport")?.addEventListener("click", (e)=>{ e.preventDefault(); alert("Customer Service soon. Email: support@trustmeai.online"); });
    $id("acSocial")?.addEventListener("click", (e)=>{ e.preventDefault(); alert("Telegram channel coming soon."); });

    // Team placeholder
    $id("acTeam")?.addEventListener("click", (e)=>{ e.preventDefault(); alert("Team page coming soon"); });

    // Logout
    $id("acLogout")?.addEventListener("click", ()=>{
      window.tmLogout ? tmLogout() : localStorage.removeItem("tmUserEmail");
      document.dispatchEvent(new CustomEvent("tm-auth-changed"));
      location.href = "index.html";
    });
  });
})();
