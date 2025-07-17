import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  kindeId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
    index: true 
  },
  givenName: { type: String },
  familyName: { type: String },
  picture: { type: String },
  isEmailVerified: { type: Boolean, default: false },
  lastLoginAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
})

// Update the updatedAt field on save
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.model('User', UserSchema) 