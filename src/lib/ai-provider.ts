import Groq from 'groq-sdk'
import { GoogleGenAI, Type } from '@google/genai'
import fs from 'fs'
import path from 'path'

const CONFIG_PATH = path.join(process.cwd(), 'ai-config.json')

function readConfig() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return {}
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'))
  } catch (e) {
    console.error('Error reading AI config:', e)
    return {}
  }
}

export interface AIResponse {
  content: string
}

export async function generateAIResponse(params: {
  messages: { role: string; content: string }[]
  temperature: number
  maxTokens: number
  schema?: any
}): Promise<AIResponse> {
  const config = readConfig()
  const provider = config.provider || 'groq'
  const keys = (provider === 'groq' ? config.groqKeys : config.googleKeys) || []
  const model = provider === 'groq' ? config.groqModel : config.googleModel

  if (keys.length === 0) {
    throw new Error(`No API keys configured for provider: ${provider}`)
  }

  // Try each key in sequence (fallback on rate limit)
  let lastError: any = null
  for (const key of keys) {
    try {
      if (provider === 'groq') {
        return await callGroq(key, model, params)
      } else if (provider === 'google') {
        return await callGoogle(key, model, params)
      }
    } catch (err: any) {
      console.error(`Failed with key ${key.slice(0, 8)}... :`, err.message)
      lastError = err
      // Continue to next key on rate limit or transient errors
      if (
        err.status === 429 ||
        err.message?.includes('429') ||
        err.message?.includes('Rate limit') ||
        err.message?.includes('RESOURCE_EXHAUSTED')
      ) {
        continue
      }
      // For other errors, still try the next key
      continue
    }
  }

  throw lastError || new Error(`All keys failed for provider ${provider}`)
}

async function callGroq(apiKey: string, model: string, params: any): Promise<AIResponse> {
  const groq = new Groq({ apiKey })

  const completion = await groq.chat.completions.create({
    messages: params.messages,
    model: model || 'moonshotai/kimi-k2-instruct-0905',
    temperature: params.temperature ?? 0.75,
    max_tokens: params.maxTokens ?? 3000,
    response_format: params.schema
      ? {
          type: 'json_schema',
          json_schema: {
            name: 'zabb_story_schema',
            strict: true,
            schema: params.schema,
          },
        }
      : undefined,
  })

  return { content: completion.choices[0]?.message?.content || '' }
}

async function callGoogle(apiKey: string, model: string, params: any): Promise<AIResponse> {
  const ai = new GoogleGenAI({ apiKey })

  // Extract system instruction from messages
  const systemMessage = params.messages.find((m: any) => m.role === 'system')?.content || ''

  // Convert messages to Google AI format (user/model roles, parts)
  const contents = params.messages
    .filter((m: any) => m.role !== 'system')
    .map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }))

  // Build the config
  const config: any = {
    temperature: params.temperature ?? 0.75,
    maxOutputTokens: params.maxTokens ?? 3000,
    systemInstruction: systemMessage || undefined,
  }

  // If schema is provided, use responseJsonSchema (accepts standard JSON Schema)
  if (params.schema) {
    config.responseMimeType = 'application/json'
    config.responseJsonSchema = params.schema
  }

  const response = await ai.models.generateContent({
    model: model || 'gemini-2.0-flash',
    contents,
    config,
  })

  return { content: response.text || '' }
}
