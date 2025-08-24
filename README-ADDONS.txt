# TrustMe AI — Team + Invite (Drop-in v2)

This package gives you a **standalone Invite page** and a **tiny hook script**
that redirects your **Team** nav and **Invite Friends** button to that page,
without changing your existing layout.

## Files
- `invite.html` – standalone page with QR, link, code, and placeholders.
- `addons/invite.css` – isolated styles.
- `addons/invite.js` – invite logic (UID/code in localStorage).
- `addons/invite-hook.js` – auto-redirects Team + Invite buttons to `invite.html`.

> The QR image is generated via `api.qrserver.com` at runtime. If you prefer
> a local generator later, you can swap that in `addons/invite.js`.

## Install
1. Upload everything in this folder to your site root (same level as `index.html`).
2. Add ONE line to your existing HTML (near the end of `<body>` in your main page):

```html
<script src="./addons/invite-hook.js" defer></script>
```

That’s it. The hook watches your DOM and:
- redirects the **Team** tab to `invite.html`,
- redirects your **Invite Friends** tile/button to `invite.html`.

## Direct linking
You can also link to the page explicitly:
```html
<a href="invite.html">Invite Friends</a>
```

## Hardcode domain in the invite link (optional)
Open `addons/invite.js` and replace `buildInviteLink()` with your domain.