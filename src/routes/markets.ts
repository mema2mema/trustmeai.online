
import { Router } from 'express'
import { z } from 'zod'
import { ticker } from '../services/trading.js'
export const markets = Router()

const qSchema = z.object({ exchange: z.enum(['binance','bybit','kucoin','kraken']), symbol: z.string() })
markets.get('/markets/ticker', async (req, res, next) => {
  try{
    const q = qSchema.parse(req.query)
    const t = await ticker(q.exchange, q.symbol)
    res.json({ ok:true, data: t })
  }catch(e){ next(e) }
})

markets.get('/markets/hotlist', (_req, res) => {
  const list = [
    {s:'ETH', p:4744.4, ch:-1.81433},
    {s:'BTC', p:115963.63, ch:-0.83154},
    {s:'SOL', p:204.86, ch: 2.07783},
    {s:'XRP', p:3.0344, ch:-1.30427},
    {s:'BNB', p:887.14, ch:-1.45078},
    {s:'ADA', p:0.9135, ch:-1.93326},
    {s:'LINK',p:26.12, ch:-2.53731},
    {s:'DOT', p:4.128, ch:-1.26763},
  ]
  res.json({ ok:true, data:list })
})
