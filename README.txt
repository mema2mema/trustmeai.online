TRUSTME AI — Navbar Clean + Auth Buttons

WHAT THIS DOES
 - Removes your old hard-coded Login/Register in the navbar
 - Adds <div id="authArea"></div> automatically
 - Renders Login/Register (logged out) OR email + Logout (logged in)

FILES
 - tm-auth.js              (auth engine)
 - tm-auth-header.js       (renders auth UI into #authArea)
 - tm-auth-navbar-cleaner.js (removes old Login/Register and injects #authArea)
 - login.html, register.html

SETUP (add to every page after your header markup)
 <script src="tm-auth.js" defer></script>
 <script src="tm-auth-header.js" defer></script>
 <script src="tm-auth-navbar-cleaner.js" defer></script>

That’s it. No need to manually edit each header.
