
TrustMe AI — Invite Friends Addon
=================================

This package adds an **Invite Friends** feature without touching your existing pages.

You get two options:

A) Standalone page (quickest)
-----------------------------
1) Upload the whole folder to your site next to your current `index.html`.
2) Link the "Invite Friends" tile to `invite.html` (e.g., <a href="./invite.html">Invite Friends</a>).

B) SPA modal (embed into your existing index.html)
--------------------------------------------------
1) Include the two scripts + styles at the bottom of your current `index.html` (before </body>):

<link rel="stylesheet" href="./addons/invite.css">
<script src="./addons/qrcode.min.js"></script>
<script src="./addons/invite.js"></script>

2) On your "Invite Friends" tile/button, call `openInviteModal()` on click:
   <button onclick="openInviteModal()">Invite Friends</button>

What it does
------------
- Generates and stores a **UID** and **Invite Code** in localStorage.
- Builds your invite link: `{origin}/reg/?tid=CODE`.
- Renders a **QR code**, **copy buttons**, and **Team Data** (placeholder totals).
- Has an **Invitation Record** list area (ready for API later).

Safe by design
--------------
- No global overrides, no changes to your existing logic.
- Uses its own CSS variables and class names.
- All data is local (no network calls).

— Enjoy!
