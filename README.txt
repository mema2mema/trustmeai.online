TrustMe AI — Invite Feature (Team → Invite Friends)

Files:
- invite.html                        (page)
- addons/qrcode.min.js               (QR generator, offline)
- addons/invite-page.js              (page logic)
- addons/invite-hook.js              (site-wide hook; makes “Invite Friends” open invite.html)

Install (1 minute):
1) Upload **invite.html** to your site root (same folder as index.html).
2) Upload the whole **addons/** folder to your site root.
3) Open your main **index.html** and insert this SINGLE line just above </body>:
   <script src="./addons/invite-hook.js" defer></script>

Usage:
- On your site, clicking any “Invite Friends” tile/button will open /invite.html.
- The Invite page lets you edit your code, copy/share your link, and download the QR.
- The code is saved in localStorage under key: tm_invite_code.

If your Team screen still doesn’t respond, give me the exact HTML for that tile and I’ll add a precise selector to invite-hook.js.
