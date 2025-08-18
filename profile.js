// profile.js — reads/writes localStorage and populates profile page

function fmt(ts) {
  if (!ts) return "—";
  try { return new Date(ts).toLocaleString(); } catch { return ts; }
}

function ensureDefaults(email) {
  // nickname: email prefix if empty
  const nick = localStorage.getItem("tmNickname");
  if (!nick && email) {
    localStorage.setItem("tmNickname", email.split("@")[0]);
  }
  // membership
  if (!localStorage.getItem("tmMembership")) {
    localStorage.setItem("tmMembership", "S0");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const email = localStorage.getItem("tmUserEmail") || "";
  if (!email) {
    // not logged in → show login modal
    openModal && openModal("loginModal");
  }

  ensureDefaults(email);

  // Populate
  const $ = (id) => document.getElementById(id);

  $("piEmail").textContent = email || "—";
  $("piNick").textContent  = localStorage.getItem("tmNickname") || "—";
  $("piPhone").textContent = localStorage.getItem("tmPhone") || "—";
  $("piLevel").textContent = localStorage.getItem("tmMembership") || "S0";
  $("piReg").textContent   = fmt(localStorage.getItem("tmRegTime"));
  $("piLast").textContent  = fmt(localStorage.getItem("tmLastLogin"));

  // Edit nickname
  $("piEditNick")?.addEventListener("click", () => {
    const current = localStorage.getItem("tmNickname") || "";
    const val = prompt("Enter nickname", current);
    if (val !== null) {
      localStorage.setItem("tmNickname", val.trim() || current);
      $("piNick").textContent = localStorage.getItem("tmNickname") || "—";
    }
  });

  // Edit phone
  $("piEditPhone")?.addEventListener("click", () => {
    const current = localStorage.getItem("tmPhone") || "";
    const val = prompt("Enter phone number", current);
    if (val !== null) {
      localStorage.setItem("tmPhone", val.trim());
      $("piPhone").textContent = localStorage.getItem("tmPhone") || "—";
    }
  });

  // Copy email / phone
  $("piCopyEmail")?.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(email); alert("Email copied"); }
    catch { alert(email); }
  });
  $("piCopyPhone")?.addEventListener("click", async () => {
    const p = localStorage.getItem("tmPhone") || "";
    if (!p) return alert("No phone saved");
    try { await navigator.clipboard.writeText(p); alert("Phone copied"); }
    catch { alert(p); }
  });
});
