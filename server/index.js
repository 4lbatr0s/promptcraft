import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'
import pino from "pino";
const logger = pino();
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";

import healthRoutes from './routes/healthRoutes.js'
import authRoutes from './routes/authRoutes.js'
import promptRoutes from './routes/promptRoutes.js'
import demoRoutes from './routes/demoRoutes.js'
import webhookRoutes from './routes/webhookRoutes.js'
import userRoutes from './routes/userRoutes.js'

dotenv.config()

const app = express()

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Demo-Token'],
  optionsSuccessStatus: 200
}));

app.use(express.json())
app.use(helmet());
app.use(compression());

app.get('/test-cors', (req, res) => {
  res.json({ message: 'CORS is working!' });
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api/demo')) {
    return next();
  }
  return globalLimiter(req, res, next);
});

connectDB()

//demo routes
app.use('/api/demo', demoRoutes)

//routes
app.use('/api', healthRoutes)
app.use('/api', authRoutes)
app.use('/api', promptRoutes)
app.use('/api', webhookRoutes)
app.use('/api', userRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})