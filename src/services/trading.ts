
import { makeClient, ExchangeId, Creds } from '../exchanges/ccxtClient.js'
import { cfg } from '../config.js'
import { credit, getBalance as paperBalance, place as paperPlace } from './paperBook.js'

export async function ticker(exchange: ExchangeId, symbol: string){
  const client = makeClient(exchange)
  await client.loadMarkets()
  const t = await client.fetchTicker(symbol)
  return { symbol: t.symbol, last: t.last, bid: t.bid, ask: t.ask, high: t.high, low: t.low, baseVolume: t.baseVolume }
}

export async function balance(exchange: ExchangeId, creds?: Creds){
  if(cfg.paper){
    // Give demo funds in paper mode
    credit(exchange, creds?.apiKey, 'USDT', 10_000)
    return paperBalance(exchange, creds?.apiKey)
  }
  const k = creds?.apiKey || cfg.keys[exchange]?.apiKey
  const s = creds?.secret || cfg.keys[exchange]?.secret
  const client = makeClient(exchange, { apiKey: k, secret: s, password: creds?.password })
  const b = await client.fetchBalance()
  return b.total
}

type OrderArgs = { exchange: ExchangeId, symbol: string, side: 'buy'|'sell', type: 'market'|'limit', amount: number, price?: number, creds?: Creds }
export async function placeOrder(args: OrderArgs){
  if(cfg.paper){
    const id = `paper_${Date.now()}_${Math.random().toString(36).slice(2,8)}`
    const o = paperPlace(args.exchange, args.creds?.apiKey, { id, symbol: args.symbol, side: args.side, type: args.type, amount: args.amount, price: args.price, ts: Date.now() })
    return { id: o.id, status:'closed', info:'paper' }
  }
  const k = args.creds?.apiKey || cfg.keys[args.exchange]?.apiKey
  const s = args.creds?.secret || cfg.keys[args.exchange]?.secret
  const client = makeClient(args.exchange, { apiKey: k, secret: s, password: args.creds?.password })
  const ord = await client.createOrder(args.symbol, args.type, args.side, args.amount, args.price)
  return { id: ord.id, status: ord.status, info: ord.info }
}
