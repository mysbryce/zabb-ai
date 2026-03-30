import { NextResponse } from 'next/server'
import { generateAIResponse } from '@/lib/ai-provider'
import fs from 'fs'
import path from 'path'

type UserMessageKind = 'speech' | 'action' | 'narration'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  kind?: UserMessageKind
}

interface StructuredStoryItem {
  type: 'action' | 'dialogue'
  text: string
}

interface StructuredResponse {
  status: {
    date: string
    time: string
    location: string
    emotion: string
    outfit: string
    desire: string
  }
  story_flow: StructuredStoryItem[]
  internal_thought: string
}

const USER_KIND_DEFAULT: UserMessageKind = 'speech'

const USER_MESSAGE_WRAPPERS: Record<UserMessageKind, string> = {
  speech: 'USER_SPEECH',
  action: 'USER_ACTION',
  narration: 'USER_NARRATION',
}

function normalizeUserMessageKind(kind?: string): UserMessageKind {
  if (kind === 'action' || kind === 'narration' || kind === 'speech') {
    return kind
  }
  return USER_KIND_DEFAULT
}

function formatMessageForModel(message: ChatMessage) {
  if (message.role !== 'user') {
    return {
      role: message.role,
      content: message.content,
    }
  }

  const kind = normalizeUserMessageKind(message.kind)
  const wrapper = USER_MESSAGE_WRAPPERS[kind]

  return {
    role: message.role,
    content: `[${wrapper}]\n${message.content}`,
  }
}

function detectRoleBoundaryViolation(rawContent: string, userName: string) {
  try {
    const parsed = JSON.parse(rawContent) as {
      story_flow?: Array<{ type?: string; text?: string }>
      internal_thought?: string
    }

    const fragments = [
      ...(parsed.story_flow?.map((item) => item.text ?? '') ?? []),
      parsed.internal_thought ?? '',
    ]
      .join('\n')
      .toLowerCase()

    const escapedName = userName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const userNameRegex = escapedName ? new RegExp(escapedName.toLowerCase()) : null

    const suspiciousPatterns = [
      /คุณพูดว่า/,
      /คุณตอบว่า/,
      /คุณกระซิบว่า/,
      /คุณบอกว่า/,
      /คุณคิดว่า/,
      /คุณรู้สึกว่า/,
      /you said/,
      /you replied/,
      /you whispered/,
      /you thought/,
      /you felt/,
    ]

    const foundGenericViolation = suspiciousPatterns.some((pattern) => pattern.test(fragments))
    const foundNamedViolation = userNameRegex
      ? userNameRegex.test(fragments) &&
        /(พูดว่า|ตอบว่า|กระซิบว่า|บอกว่า|คิดว่า|รู้สึกว่า|said|replied|whispered|thought|felt)/.test(fragments)
      : false

    return foundGenericViolation || foundNamedViolation
  } catch {
    return false
  }
}

function isSchemaValidationError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error && 'message' in error
        ? String((error as { message?: unknown }).message)
        : String(error ?? '')

  return message.includes('json_validate_failed') || message.includes('does not match the expected schema')
}

function cleanStoryText(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

function stripWrappingQuotes(text: string) {
  return text
    .replace(/^["“”„«»'']+/, '')
    .replace(/["“”„«»'']+$/, '')
    .trim()
}

function splitMixedStoryItem(item: StructuredStoryItem): StructuredStoryItem[] {
  const text = cleanStoryText(item.text)
  if (!text) {
    return []
  }

  const quoteRegex = /"([^"]+)"|“([^”]+)”/g
  const segments: StructuredStoryItem[] = []
  let cursor = 0
  let match: RegExpExecArray | null

  while ((match = quoteRegex.exec(text)) !== null) {
    const start = match.index
    const fullMatch = match[0] ?? ''
    const spokenText = cleanStoryText(stripWrappingQuotes(match[1] ?? match[2] ?? fullMatch))
    const before = cleanStoryText(text.slice(cursor, start))

    if (before) {
      segments.push({ type: 'action', text: before })
    }

    if (spokenText) {
      segments.push({ type: 'dialogue', text: spokenText })
    }

    cursor = start + fullMatch.length
  }

  if (segments.length === 0) {
    if (item.type === 'dialogue') {
      return [{ type: 'dialogue', text: stripWrappingQuotes(text) || text }]
    }
    return [{ type: 'action', text }]
  }

  const after = cleanStoryText(text.slice(cursor))
  if (after) {
    segments.push({ type: 'action', text: after })
  }

  return segments
}

function normalizeStructuredResponse(rawContent: string) {
  const parsed = JSON.parse(rawContent) as StructuredResponse

  const normalizedStoryFlow = parsed.story_flow.flatMap((item) => splitMixedStoryItem(item))

  return JSON.stringify({
    ...parsed,
    story_flow: normalizedStoryFlow.length > 0 ? normalizedStoryFlow : parsed.story_flow,
    internal_thought: cleanStoryText(parsed.internal_thought),
  })
}

export async function POST(req: Request) {
  try {
    const { character, userPersona, messages, settings } = (await req.json()) as {
      character: {
        name: string
        age?: string
        gender?: string
        personality: string
        appearance: string
        background: string
        startingSituation: string
      }
      userPersona: {
        name: string
        info?: string
      }
      messages: ChatMessage[]
      settings?: {
        temperature?: number
        maxTokens?: number
      }
    }

    // 1. Load System Core Instructions
    const instructionPath = path.join(process.cwd(), 'src/assets/instructions/core-instruction.md')
    let coreInstruction = ''
    try {
      coreInstruction = fs.readFileSync(instructionPath, 'utf8')
    } catch (e) {
      console.error('Failed to read instruction file:', e)
      coreInstruction = `You are an AI character in a roleplay engine. 
Strictly follow these rules:
1. Language: Thai (ภาษาไทย). Use beautiful, descriptive novel-style language.
2. Role: Only play as the Character. NEVER speak or act for the User.
3. Format: Respond using the provided JSON schema.`
    }

    // 2. Build Character Context
    const characterContext = `
---
CHARACTER CONTEXT:
Name: ${character.name}
Age: ${character.age || 'Not specified'}
Gender: ${character.gender || 'Not specified'}
Personality: ${character.personality}
Appearance: ${character.appearance}
Background: ${character.background}
Starting Situation: ${character.startingSituation}
---
`

    // 3. Build User Context
    const userContext = `
---
USER CONTEXT:
User Name (Call them by this): ${userPersona.name}
User Info: ${userPersona.info || 'Not specified'}
---
`

    const baseSystemPrompt = `
# SYSTEM MANDATE
1. ROLE: You are ONLY the AI character "${character.name}". 
2. USER: The user is "${userPersona.name}".
3. CONSTRAINT: Never speak, act, or think for "${userPersona.name}".
4. LANGUAGE: Always respond in Thai (ภาษาไทย). Use beautiful novel-style prose.
5. FORMAT: You MUST respond using the provided JSON Schema.
6. LENGTH:
   - The combined text in story_flow and internal_thought should normally be at least 700 Thai words unless the user explicitly asks for something shorter.
   - Favor multiple long action paragraphs with some dialogue, not a short compressed reply.
6. MESSAGE INTERPRETATION:
   - [USER_SPEECH] means the user's exact spoken words to you.
   - [USER_ACTION] means the user's physical action in the current scene.
   - [USER_NARRATION] means a scene update, event, or narration the user is telling you to perceive.
   - Never convert one type into another.
   - Never add extra dialogue, action, intention, or inner thoughts for the user.
7. RESPONSE BEHAVIOR:
   - React only as "${character.name}".
   - You may acknowledge the user's latest message type, but you must not continue the user's side of the scene for them.

# CORE INSTRUCTIONS
${coreInstruction}

# CHARACTER CONTEXT
${characterContext}

# USER CONTEXT
${userContext}
`

    const buildMessages = (extraGuard?: string) => [
      {
        role: 'system',
        content: extraGuard ? `${baseSystemPrompt}\n\n# EXTRA GUARD\n${extraGuard}` : baseSystemPrompt,
      },
      ...messages.map((message) => formatMessageForModel(message)),
    ]

    const temperature = settings?.temperature ?? 0.75
    const max_tokens = Math.max(settings?.maxTokens ?? 3000, 5000)

    const schema = {
      type: 'object',
      properties: {
        status: {
          type: 'object',
          properties: {
            date: { type: 'string', description: 'วันหรือช่วงเวลาของฉากในโลกบทบาทสมมติ' },
            time: { type: 'string', description: 'เวลาปัจจุบันของฉากในโลกบทบาทสมมติ' },
            location: { type: 'string', description: 'สถานที่เฉพาะเจาะจงของฉากปัจจุบัน' },
            emotion: { type: 'string', description: 'สภาวะอารมณ์ของตัวละครที่มีน้ำหนักทางอารมณ์' },
            outfit: { type: 'string', description: 'เสื้อผ้าหรือภาพลักษณ์ภายนอกของตัวละครในขณะนั้น' },
            desire: { type: 'string', description: 'ความต้องการหรือแรงขับหลักของตัวละครในฉากนี้' },
          },
          required: ['date', 'time', 'location', 'emotion', 'outfit', 'desire'],
          additionalProperties: false,
        },
        story_flow: {
          type: 'array',
          minItems: 6,
          description: 'เนื้อเรื่องหลักของฉาก ต้องยาว รายละเอียดแน่น และให้ความรู้สึกเหมือนนิยายหนึ่งตอนสั้นๆ',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['action', 'dialogue'] },
              text: {
                type: 'string',
                minLength: 40,
                description: 'สำหรับ action ให้บรรยายเชิงนิยายอย่างละเอียดพร้อมบรรยากาศ ประสาทสัมผัส อารมณ์ และภาษากาย; สำหรับ dialogue ให้คงน้ำเสียงตัวละครและเชื่อมกับฉากอย่างเป็นธรรมชาติ',
              },
            },
            required: ['type', 'text'],
            additionalProperties: false,
          },
        },
        internal_thought: { 
          type: 'string',
          minLength: 80,
          description: 'ความคิดในใจของตัวละครเพียงฝ่ายเดียว เข้มข้น ลึกซึ้ง และสอดคล้องกับอารมณ์ของฉาก' 
        },
      },
      required: ['status', 'story_flow', 'internal_thought'],
      additionalProperties: false,
    }

    const runGeneration = async (extraGuard?: string, overrideTemperature?: number) =>
      generateAIResponse({
        messages: buildMessages(extraGuard),
        temperature: overrideTemperature ?? temperature,
        maxTokens: max_tokens,
        schema,
      })

    const generateWithRecovery = async () => {
      try {
        return await runGeneration()
      } catch (error) {
        if (!isSchemaValidationError(error)) {
          throw error
        }

        return runGeneration(
          `Return one complete JSON object only. Do not stop after status. You must always provide status, a long story_flow array, and internal_thought. Ensure the JSON matches the schema exactly and complete the scene in lush Thai prose.`,
          0.6
        )
      }
    }

    let completion = await generateWithRecovery()

    completion = {
      ...completion,
      content: normalizeStructuredResponse(completion.content),
    }

    if (detectRoleBoundaryViolation(completion.content, userPersona.name)) {
      completion = await runGeneration(
        `Your previous answer drifted into speaking, acting, or thinking for "${userPersona.name}". Regenerate the whole response and strictly keep all user behavior limited to the exact wrapped inputs only.`
      )
      completion = {
        ...completion,
        content: normalizeStructuredResponse(completion.content),
      }
    }

    return NextResponse.json({ content: completion.content })
  } catch (error: any) {
    console.error('AI Provider Error:', error)
    return NextResponse.json(
      {
        error:
          isSchemaValidationError(error)
            ? 'AI ตอบกลับมาไม่ครบตามรูปแบบ JSON ที่ระบบต้องใช้ ลองส่งใหม่อีกครั้ง หรือเพิ่มรายละเอียดข้อความล่าสุดเพื่อให้ฉากชัดขึ้น'
            : error.message || 'Failed to generate response',
      },
      { status: 500 }
    )
  }
}

