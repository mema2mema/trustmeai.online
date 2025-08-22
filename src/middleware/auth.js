import jwt from 'jsonwebtoken';
import { config } from 'dotenv'; config();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export function requireAuth(req,res,next){
  try{
    const token = req.cookies?.tm_jwt;
    if(!token) return res.status(401).json({error:'Auth required'});
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  }catch(e){ return res.status(401).json({error:'Auth required'}); }
}
