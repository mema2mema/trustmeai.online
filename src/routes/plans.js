import express from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { uid, now, minMaxForTier, dailyRateForTier } from '../utils.js';

const router = express.Router();

router.post('/activate', requireAuth, (req,res)=>{
  const { tier, amount } = req.body || {};
  const t = String(tier||'').toUpperCase();
  const a = Number(amount||0);
  if(!['T1','T2','T3','T4'].includes(t)) return res.status(400).json({error:'Invalid tier'});
  const {min,max} = minMaxForTier(t);
  if(a < min || a > max) return res.status(400).json({error:`Amount must be between ${min} and ${max}`});
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(req.user.uid);
  if(user.balance_available < a) return res.status(400).json({error:'Insufficient balance'});
  const rate = dailyRateForTier(t);
  const pid = uid();
  const tx = db.transaction(()=>{
    db.prepare('UPDATE users SET balance_available = balance_available - ?, balance_locked = balance_locked + ? WHERE id=?')
      .run(a, a, user.id);
    db.prepare('INSERT INTO positions (id,user_id,tier,amount,rate_daily,created_at) VALUES (?,?,?,?,?,?)')
      .run(pid, user.id, t, a, rate, now());
  });
  tx();
  res.json({ ok:true, position_id: pid, tier: t, amount: a, rate_daily: rate });
});

router.get('/positions', requireAuth, (req,res)=>{
  const rows = db.prepare('SELECT * FROM positions WHERE user_id=? ORDER BY created_at DESC').all(req.user.uid);
  res.json({ positions: rows });
});

export default router;
