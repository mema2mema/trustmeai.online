
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { cfg } from './config.js'
import { auth } from './middleware/auth.js'
import { errorHandler } from './middleware/error.js'
import { health } from './routes/health.js'
import { markets } from './routes/markets.js'
import { orders } from './routes/orders.js'
import { account } from './routes/account.js'
import { logger } from './logger.js'

const app = express()
app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use(rateLimit({ windowMs: 30 * 1000, max: 60 }))

app.use('/api/v1', health)
app.use('/api/v1', auth, markets)
app.use('/api/v1', auth, account)
app.use('/api/v1', auth, orders)

app.use(errorHandler)

app.listen(cfg.port, () => logger.info(`API up on http://localhost:${cfg.port} paper=${cfg.paper}`))
