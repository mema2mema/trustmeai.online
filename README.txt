TrustMe AI — Classic Auth Add‑On
================================

What this is
------------
A drop‑in Login/Register for your OLD site style.
• Puts two pill buttons (Login / Register) in your header, right side.
• Opens glass pop‑up modals that match your old green theme.
• Uses your backend API (set the API URL in auth-classic.js).

How to install (3 steps)
------------------------
1) Copy folders:
   - css/auth-classic.css
   - js/auth-classic.js
   into your existing `trustmeai-online/` project.

2) In every page that has the top navbar, add this placeholder where the buttons should sit (usually right side of the nav):
   <div id="authArea"></div>

3) Include files:
   In <head> (after your main CSS):
     <link rel="stylesheet" href="css/auth-classic.css">
   Before </body> (after your other scripts):
     <script>const API = "http://localhost:8080";</script> <!-- change to your API -->
     <script src="js/auth-classic.js" defer></script>

That’s it. You’ll see Login/Register again.