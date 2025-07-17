import mongoose from 'mongoose'

const PromptConversionSchema = new mongoose.Schema({
  originalPrompt: { type: String, required: true },
  generatedJson: { type: Object, required: true },
  llmProvider: { type: String, required: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('PromptConversion', PromptConversionSchema) 