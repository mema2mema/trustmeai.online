import express from 'express';
import QRCode from 'qrcode';
import { requireAuth } from '../middleware/auth.js';
import { trc20AddressForEmail } from '../utils.js';
import db from '../db.js';

const router = express.Router();

router.get('/deposit-address', requireAuth, async (req,res)=>{
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(req.user.uid);
  const address = trc20AddressForEmail(user.email);
  const qr = await QRCode.toDataURL(address);
  res.json({ chain:'TRON', asset:'USDT', address, qr });
});

router.post('/mock-credit', requireAuth, (req,res)=>{
  const { amount } = req.body || {};
  const a = Number(amount||0);
  if(!(a>0)) return res.status(400).json({error:'Amount > 0 required'});
  db.prepare('UPDATE users SET balance_available = balance_available + ? WHERE id=?')
    .run(a, req.user.uid);
  const user = db.prepare('SELECT balance_available FROM users WHERE id=?').get(req.user.uid);
  res.json({ ok:true, balance_available: user.balance_available });
});

export default router;
