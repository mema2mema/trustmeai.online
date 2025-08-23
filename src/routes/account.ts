
import { Router } from 'express'
import { z } from 'zod'
import { balance } from '../services/trading.js'
export const account = Router()

const bodySchema = z.object({
  exchange: z.enum(['binance','bybit','kucoin','kraken']),
  creds: z.object({ apiKey: z.string().optional(), secret: z.string().optional(), password: z.string().optional() }).optional()
})

account.post('/account/balance', async (req, res, next) => {
  try{
    const b = bodySchema.parse(req.body)
    const out = await balance(b.exchange, b.creds)
    res.json({ ok:true, data: out })
  }catch(e){ next(e) }
})
