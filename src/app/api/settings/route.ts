import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const CONFIG_PATH = path.join(process.cwd(), 'ai-config.json')
const SUPPORTED_GROQ_RESPONSE_FORMAT_MODELS = [
  'moonshotai/kimi-k2-instruct-0905',
  'openai/gpt-oss-20b',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-safeguard-20b',
  'meta-llama/llama-4-scout-17b-16e-instruct',
] as const
const SUPPORTED_GROQ_RESPONSE_FORMAT_MODEL_SET = new Set<string>(SUPPORTED_GROQ_RESPONSE_FORMAT_MODELS)

const DEFAULT_CONFIG = {
  provider: 'groq',
  groqKeys: [],
  googleKeys: [],
  groqModel: 'moonshotai/kimi-k2-instruct-0905',
  googleModel: 'gemini-2.5-flash',
  temperature: 0.75,
  maxTokens: 3000,
}

function normalizeConfig(config: Record<string, any>) {
  const legacyModel = typeof config.model === 'string' ? config.model : undefined
  const merged = {
    ...DEFAULT_CONFIG,
    ...config,
    groqModel: config.groqModel ?? legacyModel ?? DEFAULT_CONFIG.groqModel,
  }

  if (!SUPPORTED_GROQ_RESPONSE_FORMAT_MODEL_SET.has(String(merged.groqModel))) {
    merged.groqModel = DEFAULT_CONFIG.groqModel
  }

  if (!merged.googleModel) {
    merged.googleModel = DEFAULT_CONFIG.googleModel
  }

  return {
    provider: merged.provider,
    groqKeys: merged.groqKeys,
    googleKeys: merged.googleKeys,
    groqModel: merged.groqModel,
    googleModel: merged.googleModel,
    temperature: merged.temperature,
    maxTokens: merged.maxTokens,
  }
}

function readConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return DEFAULT_CONFIG
  }
  try {
    const data = fs.readFileSync(CONFIG_PATH, 'utf8')
    return normalizeConfig(JSON.parse(data))
  } catch (error) {
    console.error('Failed to read ai-config.json:', error)
    return DEFAULT_CONFIG
  }
}

function writeConfig(config: any) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(normalizeConfig(config), null, 2), 'utf8')
  } catch (error) {
    console.error('Failed to write ai-config.json:', error)
  }
}

export async function GET() {
  const config = readConfig()
  return NextResponse.json(config)
}

export async function POST(req: Request) {
  try {
    const newConfig = await req.json()
    const currentConfig = readConfig()
    const updatedConfig = normalizeConfig({ ...currentConfig, ...newConfig })
    writeConfig(updatedConfig)
    return NextResponse.json({ success: true, config: updatedConfig })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
