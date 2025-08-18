// profile.js — reads/writes localStorage and populates profile page

function fmt(ts) {
  if (!ts) return "—";
  try { return new Date(Number(ts)).toLocaleString(); } catch { return ts; }
}

function ensureDefaults(email) {
  // nickname: email prefix if empty
  const nick = localStorage.getItem("tmNickname");
  if (!nick && email) {
    localStorage.setItem("tmNickname", email.split("@")[0]);
  }
  // membership default -> T1
  if (!localStorage.getItem("tmMembership")) {
    localStorage.setItem("tmMembership", "T1");
  }
  // registration time placeholder
  if (!localStorage.getItem("tmRegTime")) {
    localStorage.setItem("tmRegTime", Date.now().toString());
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const email = localStorage.getItem("tmUserEmail") || "";
  if (!email) {
    // not logged in → show login modal
    window.openModal && openModal("loginModal");
  }

  ensureDefaults(email);

  const $ = (id) => document.getElementById(id);

  const refresh = () => {
    $("piEmail").textContent = localStorage.getItem("tmUserEmail") || "—";
    $("piNick").textContent  = localStorage.getItem("tmNickname") || "—";
    $("piPhone").textContent = localStorage.getItem("tmPhone") || "—";
    $("piLevel").textContent = localStorage.getItem("tmMembership") || "T1";
    $("piReg").textContent   = fmt(localStorage.getItem("tmRegTime"));
    $("piLast").textContent  = fmt(localStorage.getItem("tmLastLogin"));
  };
  refresh();

  // Edit nickname
  $("piEditNick")?.addEventListener("click", () => {
    const current = localStorage.getItem("tmNickname") || "";
    const val = prompt("Enter nickname", current);
    if (val !== null) {
      localStorage.setItem("tmNickname", val.trim() || current);
      refresh();
    }
  });

  // Edit phone
  $("piEditPhone")?.addEventListener("click", () => {
    const current = localStorage.getItem("tmPhone") || "";
    const val = prompt("Enter phone number", current);
    if (val !== null) {
      localStorage.setItem("tmPhone", val.trim());
      refresh();
    }
  });

  // Copy email / phone
  $("piCopyEmail")?.addEventListener("click", async () => {
    const e = localStorage.getItem("tmUserEmail") || "";
    try { await navigator.clipboard.writeText(e); alert("Email copied"); }
    catch { alert(e); }
  });
  $("piCopyPhone")?.addEventListener("click", async () => {
    const p = localStorage.getItem("tmPhone") || "";
    if (!p) return alert("No phone saved");
    try { await navigator.clipboard.writeText(p); alert("Phone copied"); }
    catch { alert(p); }
  });

  // Edit membership level (T1–T4)
  $("piEditLevel")?.addEventListener("click", () => {
    const current = localStorage.getItem("tmMembership") || "T1";
    const val = prompt("Set membership level (T1, T2, T3, T4)", current);
    if (val) {
      const v = val.toUpperCase().trim();
      if (["T1","T2","T3","T4"].includes(v)) {
        localStorage.setItem("tmMembership", v);
        refresh();
        alert("Membership updated to " + v);
      } else {
        alert("Invalid level. Use T1, T2, T3 or T4.");
      }
    }
  });
});
