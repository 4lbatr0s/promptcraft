import { z } from 'zod'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ChatMistralAI } from '@langchain/mistralai'
import { ChatCohere } from '@langchain/cohere'
import {
  SYSTEM_PROMPT,
  USER_PROMPT_TEMPLATE,
  ERROR_PROMPT
} from './constants/prompts.js'
import { promptJsonSchema } from './schemas/promptSchema.js'
import { GEMINI_MODEL, MISTRAL_MODEL, COHERE_MODEL, PROVIDER_INFOS } from './constants/modelInfo.js'
import pino from "pino";
const logger = pino();

const createProviders = () => {
  const providers = []

  if (process.env.GOOGLE_GEMINI_API_KEY) {
    providers.push({
      name: PROVIDER_INFOS.gemini.name,
      model: new ChatGoogleGenerativeAI({
        model: GEMINI_MODEL,
        apiKey: process.env.GOOGLE_GEMINI_API_KEY,
        temperature: PROVIDER_INFOS.gemini.temperature,
        streaming: true,
      })
    })
  }

  if (process.env.MISTRAL_API_KEY) {
    providers.push({
      name: PROVIDER_INFOS.mistral.name,
      model: new ChatMistralAI({
        model: MISTRAL_MODEL,
        apiKey: process.env.MISTRAL_API_KEY,
        temperature: PROVIDER_INFOS.mistral.temperature,
        streaming: true,
      })
    })
  }

  if (process.env.COHERE_API_KEY) {
    providers.push({
      name: PROVIDER_INFOS.cohere.name,
      model: new ChatCohere({
        model: COHERE_MODEL,
        apiKey: process.env.COHERE_API_KEY,
        temperature: PROVIDER_INFOS.cohere.temperature,
        streaming: true,
      })
    })
  }

  return providers
}

function extractJsonFromMarkdown(content) {
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (jsonMatch) {
    return jsonMatch[1].trim()
  }
  return content.trim()
}

async function streamLLM(model, prompt, onChunk, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const messages = [
        ['system', SYSTEM_PROMPT],
        ['human', USER_PROMPT_TEMPLATE(prompt)]
      ]

      let fullContent = ''
      // Stream the response
      const stream = await model.stream(messages)

      logger.info('stream is here:', stream)

      for await (const chunk of stream) {
        logger.info('chunk of stream:', chunk);
        const content = chunk.contentconvertPromptWithFallbackStream
        let chunkCount = 1;
        if (content) {
          fullContent += content

          onChunk({
            type: 'chunk', //her bir parca icin chunk
            content: content,
            fullContent: fullContent,
            provider: model.constructor.name
          })
        }
      }

      logger.info(`${model.constructor.name} streaming completed`)

      logger.info(`full content is: ${fullContent}`);

      // Process the final content
      const cleanJson = extractJsonFromMarkdown(fullContent)

      logger.info(`cleanJson is:`, cleanJson);

      const jsonResponse = JSON.parse(cleanJson)

      logger.info(`jsonResponse is:`, jsonResponse);

      const validatedJson = promptJsonSchema.parse(jsonResponse)

      logger.info(`validatedJson is:`, validatedJson);

      onChunk({
        type: 'complete',
        content: fullContent,
        json: validatedJson,
        provider: model.constructor.name
      })

      return validatedJson

    } catch (err) {
      logger.error(`Streaming attempt ${attempt + 1} failed:`, err.message)

      onChunk({
        type: 'error',
        error: err.message,
        attempt: attempt + 1,
        provider: model.constructor.name
      })

      if (err.message.includes('JSON') && attempt < maxRetries - 1) {
        try {
          // Try correction without streaming first
          const correctionResponse = await model.invoke([
            ['system', SYSTEM_PROMPT + '\n\n' + ERROR_PROMPT],
            ['human', USER_PROMPT_TEMPLATE(prompt)]
          ])

          const cleanCorrectedJson = extractJsonFromMarkdown(correctionResponse.content)
          const correctedJson = JSON.parse(cleanCorrectedJson)
          const validatedJson = promptJsonSchema.parse(correctedJson)

          onChunk({
            type: 'complete',
            content: correctionResponse.content,
            json: validatedJson,
            provider: model.constructor.name,
            corrected: true
          })

          return validatedJson

        } catch (correctionErr) {
          logger.error('JSON correction failed:', correctionErr.message)
          onChunk({
            type: 'error',
            error: correctionErr.message,
            correction: true,
            provider: model.constructor.name
          })
        }
      }

      if (attempt === maxRetries - 1) {
        throw err
      }
    }
  }
}

function isRetryableError(error) {
  const retryableErrors = [
    'rate limit',
    '429',
    'timeout',
    'JSON',
    'network',
    'connection'
  ]

  return retryableErrors.some(keyword =>
    error.message.toLowerCase().includes(keyword)
  )
}

export async function convertPromptWithFallbackStream(prompt, onChunk) {
  const providers = createProviders()

  if (providers.length === 0) {
    throw new Error('No LLM providers configured. Please add at least one API key.')
  }

  let lastError = null

  for (const provider of providers) {
    try {
      logger.info(`Attempting streaming conversion with ${provider.name}...`)

      onChunk({
        type: 'provider',
        provider: provider.name,
        status: 'starting'
      })

      const result = await streamLLM(provider.model, prompt, onChunk)

      logger.info(`Successfully converted with ${provider.name}`)
      logger.info('Result from streamLLM:', result)

      return { 
        provider: provider.name,
        json: result // This should be the actual parsed JSON from the LLM
      }

    } catch (err) {
      logger.error(`Error with ${provider.name}:`, err.message)
      lastError = err

      onChunk({
        type: 'provider_error',
        provider: provider.name,
        error: err.message
      })

      if (!isRetryableError(err)) {
        throw err
      }
    }
  }

  throw lastError || new Error('All LLM providers failed')
}

export async function convertPromptWithFallback(prompt) {
  const providers = createProviders()

  if (providers.length === 0) {
    throw new Error('No LLM providers configured. Please add at least one API key.')
  }

  let lastError = null

  for (const provider of providers) {
    try {
      logger.info(`Attempting conversion with ${provider.name}...`)

      // Use non-streaming version for backward compatibility
      const nonStreamingModel = new provider.model.constructor({
        ...provider.model,
        streaming: false
      })

      const messages = [
        ['system', SYSTEM_PROMPT],
        ['human', USER_PROMPT_TEMPLATE(prompt)]
      ]

      const response = await nonStreamingModel.invoke(messages)
      const cleanJson = extractJsonFromMarkdown(response.content)
      const jsonResponse = JSON.parse(cleanJson)
      const result = promptJsonSchema.parse(jsonResponse)

      logger.info(`Successfully converted with ${provider.name}`)
      return { provider: provider.name, json: result }

    } catch (err) {
      logger.error(`Error with ${provider.name}:`, err.message)
      lastError = err

      if (!isRetryableError(err)) {
        throw err
      }
    }
  }

  throw lastError || new Error('All LLM providers failed')
}

export { promptJsonSchema }