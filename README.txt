TrustMe AI — Home Yield Calculator (Drop‑in)
===============================================

This bundle adds a responsive Yield Calculator to your **Home** page.
No CSS edits needed. One file self-injects HTML + styles.

Files
-----
js/home-calculator.bundle.js          # self-injects styles + calculator section
index-example-with-calculator.html    # example homepage using the bundle

Quick Install (fastest)
-----------------------
1) Upload `js/home-calculator.bundle.js` to your site's `js/` folder.
2) Open **index.html** and add this tag before </body>:
   <script src="js/home-calculator.bundle.js" defer></script>
3) Deploy. Done.

How it works
------------
• The script adds a 'Yield Calculator' section after your first main container.
• If it can't find a container, it appends to <body>.
• It matches your dark "glass" style and is fully responsive.

Deep-link
---------
• Clicking 'Activate Plan' will send users to strategy.html with:
    strategy.html#plan=T2&amount=5000
  You can read those values on that page to preselect a plan (optional).
