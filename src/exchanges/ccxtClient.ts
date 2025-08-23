
import ccxt from 'ccxt'

export type ExchangeId = 'binance' | 'bybit' | 'kucoin' | 'kraken'
export type Creds = { apiKey?: string, secret?: string, password?: string }

export function makeClient(id: ExchangeId, creds?: Creds){
  const cls = (ccxt as any)[id]
  if(!cls) throw new Error(`Unsupported exchange: ${id}`)
  const opts: any = {
    apiKey: creds?.apiKey,
    secret: creds?.secret,
    password: creds?.password,
    enableRateLimit: true,
    options: { defaultType: 'spot' }
  }
  const client = new cls(opts)
  return client
}
