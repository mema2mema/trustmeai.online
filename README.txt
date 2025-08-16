TrustMe AI — Safe Patch (no conflicts)
=======================================

This patch keeps your working Home/Strategy/Assets/Deposit/Withdraw intact
and fixes Login/Register + Strategy plan activation wiring.

Files included (drop-in replacements):
 - login.html
 - register.html
 - tm-auth.js              (minimal, no header/nav injection)
 - guard.js                (optional: page lock helper)
 - strategy.html           (only the bottom <script> section updated to safely bind)
 - script.js               (exposes window.bindActivatePlan + robust handlers)

How to install
--------------
1) BACKUP your current folder.
2) Copy the files from this patch into your site root (same place as index.html).
   Allow overwrite for the matching files above ONLY.
3) Deploy, then hard refresh your browser (Ctrl+F5).

Optional page lock
------------------
If you want to require login for a page, add to that page:
  <body data-auth="required">
and include (before </body>):
  <script src="tm-auth.js"></script>
  <script src="guard.js"></script>
Users not logged in are redirected to login.html?next=<thatpage>.

Notes
-----
- The Strategy page update makes sure bindActivatePlan() is called AFTER the DOM
  is ready and only if the function exists (prevents silent failures).
- The script.js update exposes bindActivatePlan on window and uses data-* attributes
  to pass min/max limits per tier to the popup.
