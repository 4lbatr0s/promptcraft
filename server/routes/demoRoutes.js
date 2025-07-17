import express from 'express';
import { 
  demoAuthMiddleware, 
  generateDemoTokenHandler, 
  checkDemoUsage 
} from '../middleware/demoAuth.js';
import { convertPromptWithFallback } from '../llmService.js';

const router = express.Router();

router.post('/generate-token', generateDemoTokenHandler);

router.get('/usage', checkDemoUsage);

router.post('/convert-prompt', demoAuthMiddleware, async (req, res) => {
  const { prompt } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ 
      success: false, 
      error: 'Prompt is required' 
    });
  }
  
  try {
    const { provider, json } = await convertPromptWithFallback(prompt);
    
    const response = {
      success: true,
      data: {
        originalPrompt: prompt,
        generatedJson: json,
        llmProvider: provider,
        isDemo: true
      }
    };
    
    res.json(response);
  } catch (err) {
    console.error('Demo prompt conversion error:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

export default router; 