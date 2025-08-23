
import 'dotenv/config'

export const cfg = {
  port: Number(process.env.APP_PORT || 8787),
  token: process.env.APP_AUTH_TOKEN || 'dev-token',
  paper: String(process.env.PAPER_MODE || 'true').toLowerCase() === 'true',
  keys: {
    binance: { apiKey: process.env.BINANCE_KEY, secret: process.env.BINANCE_SECRET },
    bybit:   { apiKey: process.env.BYBIT_KEY,   secret: process.env.BYBIT_SECRET   },
    kucoin:  { apiKey: process.env.KUCOIN_KEY,  secret: process.env.KUCOIN_SECRET  },
    kraken:  { apiKey: process.env.KRAKEN_KEY,  secret: process.env.KRAKEN_SECRET  },
  }
}
