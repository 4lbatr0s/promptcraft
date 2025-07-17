import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'

import healthRoutes from './routes/healthRoutes.js'
import authRoutes from './routes/authRoutes.js'
import promptRoutes from './routes/promptRoutes.js'
import demoRoutes from './routes/demoRoutes.js'
import webhookRoutes from './routes/webhookRoutes.js'
import userRoutes from './routes/userRoutes.js'

dotenv.config()

const app = express()

app.use(cors({
  origin: ['localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

app.use(express.json())

app.get('/test-cors', (req, res) => {
  res.json({ message: 'CORS is working!' });
});

connectDB()

app.use('/api', healthRoutes)
app.use('/api', authRoutes)
app.use('/api', promptRoutes)
app.use('/api/demo', demoRoutes)
app.use('/api', webhookRoutes)
app.use('/api', userRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})