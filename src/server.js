import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import './init-db.js'; // ensure schema exists
import authRoutes from './routes/auth.js';
import walletRoutes from './routes/wallet.js';
import planRoutes from './routes/plans.js';

const app = express();
const PORT = process.env.PORT || 8080;
const ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req,res)=> res.json({ ok:true, name:'TrustMe AI Backend' }));

app.use('/auth', authRoutes);
app.use('/wallet', walletRoutes);
app.use('/plans', planRoutes);

app.use((err,req,res,next)=>{
  console.error('Unhandled error', err);
  res.status(500).json({ error:'Server error' });
});

app.listen(PORT, ()=> console.log('API listening on http://localhost:'+PORT));
