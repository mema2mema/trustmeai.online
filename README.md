
# TrustMe AI — Spot Trading API (Starter)

Production‑ready starter to place **spot** trades via popular exchanges using **CCXT**.
Includes secure defaults, rate limiting, validation, and a **paper trading mode** for safe testing.

## Quick start
```bash
# 1) Install
npm i

# 2) Copy env and edit
cp .env.example .env

# 3) Run in dev
npm run dev
# or build & start
npm run build && npm start
```

Open: `http://localhost:${APP_PORT or 8787}/api/v1/health`

## Environment (.env)
```
APP_PORT=8787
APP_AUTH_TOKEN=change-me-long-random
PAPER_MODE=true   # true = no real orders; false = use CCXT live

# Optional per-exchange default keys (trade-only, NO withdrawal permission)
BINANCE_KEY=
BINANCE_SECRET=
BYBIT_KEY=
BYBIT_SECRET=
KUCOIN_KEY=
KUCOIN_SECRET=
KRAKEN_KEY=
KRAKEN_SECRET=
```
> For **real money**, create **trade-only** keys at your exchange. Do **not** grant withdrawal permission.

## Auth
Send a bearer token:
```
Authorization: Bearer <APP_AUTH_TOKEN>
```

## Sample requests
### Health
```
GET /api/v1/health
```

### Ticker
```
GET /api/v1/markets/ticker?exchange=binance&symbol=ETH/USDT
```

### Place order (MARKET)
```
POST /api/v1/orders
Content-Type: application/json
Authorization: Bearer <token>

{
  "exchange": "binance",
  "symbol": "ETH/USDT",
  "side": "buy",
  "type": "market",
  "amount": 0.05,
  "creds": { "apiKey":"...", "secret":"..." }   // omit to use env defaults
}
```

### Balance
```
POST /api/v1/account/balance
{
  "exchange":"binance",
  "creds": { "apiKey":"...", "secret":"..." }
}
```

## Notes
- **Spot only** (no margin, futures, or leverage) enforced by `defaultType: 'spot'`.
- Defaults to **paper mode**. Set `PAPER_MODE=false` to hit a live exchange.
- You are responsible for **compliance** (KYC/AML), **user key storage**, and **risk controls**.
