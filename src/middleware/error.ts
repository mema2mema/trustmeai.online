
import { Request, Response, NextFunction } from 'express'

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction){
  console.error(err)
  res.status(500).json({ ok:false, error: 'server_error', details: String(err?.message || err) })
}
