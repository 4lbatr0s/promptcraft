import mongoose from 'mongoose'
import pino from "pino";
const logger = pino();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
    })
    
    logger.info(`MongoDB connected: ${conn.connection.host}`)
  } catch (error) {
    logger.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

export default connectDB 