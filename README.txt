TMAuth+ (safe patch)
----------------------
Files:
 - tm-auth.js  (namespaced auth + active link + optional page guard)

What it does:
 - Adds Login/Register/Logout buttons only if you add <div id="authArea"></div>
 - Optional active nav highlight (underline on current page)
 - Optional page guard (redirects to login if <body data-auth="required">)

How to use:
 1) Copy tm-auth.js to your site root (beside index.html)
 2) In your header (optional UI), add:
      <div id="authArea"></div>
      <script src="tm-auth.js"></script>
 3) To protect a page, add to the <body> tag:
      <body data-auth="required">
 4) To show the signed-in email next to Logout, set this in a tiny inline script after tm-auth.js:
      <script> TMAuth.SHOW_USER = true; </script>
