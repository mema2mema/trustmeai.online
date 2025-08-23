
import { Router } from 'express'
import { z } from 'zod'
import { placeOrder } from '../services/trading.js'

export const orders = Router()

const bodySchema = z.object({
  exchange: z.enum(['binance','bybit','kucoin','kraken']),
  symbol: z.string().min(3),
  side: z.enum(['buy','sell']),
  type: z.enum(['market','limit']),
  amount: z.number().positive(),
  price: z.number().positive().optional(),
  creds: z.object({ apiKey: z.string().optional(), secret: z.string().optional(), password: z.string().optional() }).optional()
})

orders.post('/orders', async (req, res, next) => {
  try{
    const b = bodySchema.parse(req.body)
    if(b.type==='limit' && !b.price) return res.status(400).json({ ok:false, error:'price_required_for_limit' })
    const out = await placeOrder(b as any)
    res.json({ ok:true, data: out })
  }catch(e){ next(e) }
})
