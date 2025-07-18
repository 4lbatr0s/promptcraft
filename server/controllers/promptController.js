import PromptConversion from '../models/PromptConversion.js'
import { convertPromptWithFallback, convertPromptWithFallbackStream } from '../llmService.js'
import pino from "pino";
const logger = pino();

// Original non-streaming endpoint
export const convertPrompt = async (req, res) => {
  const { prompt } = req.body
  
  if (!prompt) {
    return res.status(400).json({ 
      success: false, 
      error: 'Prompt is required' 
    })
  }
  
  try {
    const { provider, json } = await convertPromptWithFallback(prompt)
    
    const record = await PromptConversion.create({
      originalPrompt: prompt,
      generatedJson: json,
      llmProvider: provider,
      userId: req.user.id,
    })
    
    // Return only the optimized JSON, no metadata
    res.json({ 
      success: true, 
      data: {
        optimizedJson: json,
        recordId: record._id
      }
    })
  } catch (err) {
    logger.error('Prompt conversion error:', err)
    res.status(500).json({ 
      success: false, 
      error: err.message 
    })
  }
}

export const convertPromptStream = async (req, res) => {
  const { prompt } = req.body
  
  if (!prompt) {
    return res.status(400).json({ 
      success: false, 
      error: 'Prompt is required' 
    })
  }
  
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('Access-Control-Allow-Origin', '*') // TODO: Fix this for production
  res.setHeader('Access-Control-Allow-Headers', 'Cache-Control, Content-Type, Authorization')
  
  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)
  
  let finalResult = null
  
  try {
    const onChunk = (chunk) => {
      try {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`)
        
        if (chunk.type === 'complete') {
          finalResult = {
            provider: chunk.provider,
            json: chunk.json,
            content: chunk.content
          }
        }
      } catch (writeError) {
        logger.error('Error writing chunk:', writeError)
      }
    }
    
    const { provider, json } = await convertPromptWithFallbackStream(prompt, onChunk)
    
    // Send the final complete result - only the JSON, no metadata
    res.write(`data: ${JSON.stringify({ 
      type: 'complete', 
      json: json 
    })}\n\n`)
    
    try {
      logger.info(`generatedJson read from promptController:`, json)

      const record = await PromptConversion.create({
        originalPrompt: prompt,
        generatedJson: json,
        llmProvider: provider,
        userId: req.user.id,
      })
      
      res.write(`data: ${JSON.stringify({ 
        type: 'saved', 
        recordId: record._id,
        success: true 
      })}\n\n`)
      
    } catch (dbError) {
      logger.error('Database save error:', dbError)
      res.write(`data: ${JSON.stringify({ 
        type: 'save_error', 
        error: dbError.message 
      })}\n\n`)
    }
    
  } catch (err) {
    logger.error('Streaming conversion error:', err)
    res.write(`data: ${JSON.stringify({ 
      type: 'error', 
      error: err.message 
    })}\n\n`)
  }
  
  // End the stream
  res.write(`data: ${JSON.stringify({ type: 'end' })}\n\n`)
  res.end()
}

export const getHistory = async (req, res) => {
  try {
    const history = await PromptConversion.find({ 
      userId: req.user.id 
    })
    .sort({ createdAt: -1 })
    .limit(20)
    
    res.status(200).json({ success: true, data: history })
  } catch (err) {
    logger.error('History fetch error:', err)
    res.status(500).json({ 
      success: false, 
      error: err.message 
    })
  }
}