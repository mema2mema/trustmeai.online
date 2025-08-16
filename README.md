# TrustMe AI — Telegram Bot + Webhook + Mini Admin

**What you get**
- Telegram bot (`/start`, `/help`, `/mode`, `/amount`, `/daily`, `/pertrade`, `/trades`, `/days`, `/log`, `/graph`)
- Webhook server (Express) — health, projection API, admin panel
- Chart image generation for `/graph` using `chartjs-node-canvas`
- Ready for Railway/Render (Node 18+)

## Quick start (local polling)
```bash
cp .env.example .env
# edit BOT_TOKEN
npm i
npm start
# visit http://localhost:3000/health
# talk to your bot on Telegram
```

## Deploy (webhook mode on Railway)
1. Create a new Railway service from this folder.
2. Set env vars:
   - `BOT_TOKEN`
   - `PUBLIC_URL` (your Railway URL without trailing slash)
   - `WEBHOOK_SECRET` (any random string)
   - `ADMIN_PASS`
3. Deploy.
4. Open your app `/admin` (basic auth: user **admin**, pass = `ADMIN_PASS`) and click **Start Bot**.
   - or run `npm run set-webhook` from a shell if you prefer.
5. Use your bot (`/start`).

## Admin panel
- `/admin` (basic auth) lets you start/stop the bot and test the `/api/projection` endpoint.

## Projection API
`GET /api/projection?mode=perDay&amount=1000&dailyPct=2&perTradePct=1&tradesPerDay=5&days=30`
Returns an array of `{ day, start, profit, end }`.

---
**Security**: Keep `ADMIN_PASS` and `WEBHOOK_SECRET` private; rotate regularly.
