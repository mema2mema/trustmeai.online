# TrustMe AI — Backend Starter (Express + SQLite)

This is a working backend you can run locally or deploy.  
Features: **auth with email-code (demo), JWT cookie, deposit address + QR (mock TRC20), plan activation with min/max + balances**.

## Quick start
```bash
npm install
npm run init:db
npm run dev   # or: npm start
```
Open: http://localhost:8080

Copy env:
```bash
cp .env.example .env
```
Set `CORS_ORIGIN` to your Netlify URL before deploying.

## Key endpoints
- `POST /auth/register` { email, password, referral? } → returns `demo_code`
- `POST /auth/verify` { email, code } → confirm email (demo)
- `POST /auth/login` { email, password } → sets httpOnly cookie
- `GET /auth/me` → user info
- `POST /auth/logout` → clear session
- `GET /wallet/deposit-address` (auth) → { address, qr } (demo TRC20)
- `POST /wallet/mock-credit` { amount } (auth) → top up available balance (demo)
- `POST /plans/activate` { tier, amount } (auth) → validates min/max and balance
- `GET /plans/positions` (auth) → list positions

## Front-end usage (fetch)
```js
const API = "http://localhost:8080";
const res = await fetch(API + "/auth/login", {
  method:"POST",
  headers:{"Content-Type":"application/json"},
  credentials:"include",
  body: JSON.stringify({ email, password })
});
```

## Deploy
Use Render/Railway/DigitalOcean. SQLite file will be created automatically.  
Set env vars: `PORT`, `JWT_SECRET`, `CORS_ORIGIN`.
