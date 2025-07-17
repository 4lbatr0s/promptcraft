import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    //todo: remove this
    const conn = await mongoose.connect('mongodb+srv://serhat:lIR0nUG8YYsqPngG@cluster0.9jvil.mongodb.net/promptcraft', {
    })
    
    console.log(`MongoDB connected: ${conn.connection.host}`)
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

export default connectDB 