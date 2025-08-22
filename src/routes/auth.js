import express from 'express';
import db from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { uid, now } from '../utils.js';
import { config } from 'dotenv'; config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const cookieOpts = { httpOnly: true, sameSite: 'lax', secure: false, path: '/' };

router.post('/register', async (req, res) => {
  try{
    const { email, password, referral } = req.body || {};
    if(!email || !password) return res.status(400).json({error:'Email and password required'});
    const exists = db.prepare('SELECT id FROM users WHERE email=?').get(email.toLowerCase());
    if(exists) return res.status(409).json({error:'Email already registered'});
    const pass_hash = await bcrypt.hash(password, 10);
    const id = uid();
    db.prepare('INSERT INTO users (id,email,pass_hash,referral,created_at) VALUES (?,?,?,?,?)')
      .run(id, email.toLowerCase(), pass_hash, referral||null, now());
    const code = String(Math.floor(100000 + Math.random()*900000));
    const codeId = uid();
    const exp = now() + 10*60*1000;
    db.prepare('INSERT INTO email_codes (id,email,code,expires_at) VALUES (?,?,?,?)')
      .run(codeId, email.toLowerCase(), code, exp);
    res.json({ ok:true, message:'Registered. Verify email with code.', demo_code: code });
  }catch(e){ console.error(e); res.status(500).json({error:'Server error'}); }
});

router.post('/verify', (req,res)=>{
  const { email, code } = req.body || {};
  if(!email || !code) return res.status(400).json({error:'Email and code required'});
  const rec = db.prepare('SELECT * FROM email_codes WHERE email=? AND code=? AND used=0').get(email.toLowerCase(), code);
  if(!rec) return res.status(400).json({error:'Invalid code'});
  if(now() > rec.expires_at) return res.status(400).json({error:'Code expired'});
  db.prepare('UPDATE email_codes SET used=1 WHERE id=?').run(rec.id);
  res.json({ ok:true });
});

router.post('/login', async (req,res)=>{
  const { email, password } = req.body || {};
  if(!email || !password) return res.status(400).json({error:'Email and password required'});
  const user = db.prepare('SELECT * FROM users WHERE email=?').get(email.toLowerCase());
  if(!user) return res.status(401).json({error:'Invalid credentials'});
  const ok = await bcrypt.compare(password, user.pass_hash);
  if(!ok) return res.status(401).json({error:'Invalid credentials'});
  const token = jwt.sign({ uid: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('tm_jwt', token, cookieOpts);
  res.json({ ok:true });
});

router.post('/logout', (req,res)=>{
  res.clearCookie('tm_jwt', { path:'/' });
  res.json({ ok:true });
});

router.get('/me', (req,res)=>{
  try{
    const token = req.cookies?.tm_jwt;
    if(!token) return res.json({ user:null });
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id,email,referral,balance_available,balance_locked,created_at FROM users WHERE id=?')
      .get(payload.uid);
    res.json({ user });
  }catch(e){ res.json({ user:null }); }
});

export default router;
