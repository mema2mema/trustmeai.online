TRUSTME AI — Auth + Guard (final, non-conflicting)

FILES
 - tm-auth.js   -> minimal auth (register/login/logout/localStorage)
 - guard.js     -> optional page guard for protected pages
 - login.html   -> login page
 - register.html-> register page (email, password, retype, email code, referral)

HOW TO USE
1) Upload all four files to your site root (next to index.html).

2) DO NOT include tm-auth.js or guard.js on Home/Strategy/Assets/Deposit/Withdraw unless you want to protect a page.

3) To protect a page (e.g., strategy.html):
   - Add data-auth to the body tag:
       <body data-auth="required">
   - Add these two scripts (order matters) anywhere on the page (head or before </body>):
       <script src="tm-auth.js"></script>
       <script src="guard.js"></script>

   If not logged in, users are redirected to login.html?next=thatpage.html

4) Login/Register pages already include tm-auth.js and are isolated from your app code.

5) If you change style.css path, update the <link rel="stylesheet"> in login/register pages.
