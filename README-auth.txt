DROP-IN AUTH BUNDLE

1) Put 'login.html', 'register.html', and 'script.js' next to your index.html.
2) On every page header, right after </nav>, add:
     <div id="authArea" class="auth-area"></div>
3) Make sure pages include:
     <script src="script.js"></script>

That's it. Logged out -> Login + Register; Logged in -> Logout.
Register fields: email, password, retype password, email code (Send Code), referral code.
