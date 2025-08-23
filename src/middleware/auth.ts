
import { Request, Response, NextFunction } from 'express'
import { cfg } from '../config.js'

export function auth(req: Request, res: Response, next: NextFunction){
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : null
  if(!token || token !== cfg.token) return res.status(401).json({ ok:false, error:'unauthorized' })
  return next()
}
