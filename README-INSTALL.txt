TrustMe AI — Invite & Team Patch
=================================
Files added (place in project root):
- addons/invite-hook.js
- addons/nav-fixes.js
- styles/invite.css
- invite.html
- index_snippet_invite_card.html  (copy/paste snippet)
How to install
--------------
1) Copy the files/folders above into your project, keeping paths the same.
2) In your main HTML (index.html), right ABOVE </body> add:
   <script src="./addons/nav-fixes.js" defer></script>
   <script src="./addons/invite-hook.js" defer></script>
3) Make the Invite Friends card fully clickable on Home, Team, and Mine.
   Use this wrapper for the card (or add data-goto="invite" to your existing wrapper):
   See: index_snippet_invite_card.html
4) Ensure your bottom nav buttons have data-route attributes (#home, #assets, #strategy, #team, #mine)
   and your view containers use IDs: view-home, view-assets, view-strategy, view-team, view-mine.
   If your app already has a router, nav-fixes.js will no-op gracefully.
5) Open /invite.html to verify QR/link behave correctly.
   If your environment blocks CDNs, self-host QRCode.js and swap the <script> URL in invite.html.
