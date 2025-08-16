HOW TO ENABLE NAVBAR LOGIN/REGISTER → LOGOUT + EMAIL

1) Put these files in your site root (beside index.html):
   - tm-auth.js
   - tm-auth-header.js
   - login.html
   - register.html

2) In your header/navbar on every page, add this placeholder where you want the buttons:
     <div id="authArea"></div>

3) Include the scripts (after your header markup), in this order:
     <script src="tm-auth.js" defer></script>
     <script src="tm-auth-header.js" defer></script>

4) Remove any old links pointing to "#". If you also want static links as fallback:
     <a href="/login.html">Log In</a>
     <a href="/register.html">Register</a>

Result:
 - If NOT logged in → shows Log In + Register
 - If logged in      → shows user email + Logout button

These scripts DO NOT touch your Strategy/Assets/Deposit/Withdraw code.
