import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import fs from 'fs'
import path from 'path'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { character, userPersona, messages, settings } = (await req.json()) as any

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Missing GROQ_API_KEY environment variable.' },
        { status: 500 }
      )
    }

    // 1. Load System Core Instructions
    const instructionPath = path.join(process.cwd(), 'src/assets/instructions/core-instruction.md')
    let coreInstruction = ''
    let instructionSource = ''
    try {
      coreInstruction = fs.readFileSync(instructionPath, 'utf8')
      instructionSource = 'File (src/assets/instructions/core-instruction.md)'
    } catch (e) {
      console.error('Failed to read instruction file:', e)
      coreInstruction = `You are an AI character in a roleplay engine. 
Strictly follow these rules:
1. Language: Thai (ภาษาไทย). Use beautiful, descriptive novel-style language.
2. Role: Only play as the Character. NEVER speak or act for the User.
3. Format: Respond using the provided JSON schema.`
      instructionSource = 'Fallback (Hardcoded)'
    }

    console.log(`[Chat API] Using instruction source: ${instructionSource}`)

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

    // Assemble the complete System Prompt with explicit role boundaries
    const systemPrompt = `
# SYSTEM MANDATE
1. ROLE: You are ONLY the AI character "${character.name}". 
2. USER: The user is "${userPersona.name}".
3. CONSTRAINT: Never speak, act, or think for "${userPersona.name}".
4. LANGUAGE: Always respond in Thai (ภาษาไทย). Use beautiful novel-style prose.
5. FORMAT: You MUST respond using the provided JSON Schema.

# CORE INSTRUCTIONS
${coreInstruction}

# CHARACTER CONTEXT
${characterContext}

# USER CONTEXT
${userContext}
`

    // Map messages for Groq API
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      }))
    ]

    // Use provided settings or fallbacks
    const model = settings?.model || 'moonshotai/kimi-k2-instruct-0905'
    const temperature = settings?.temperature ?? 0.75
    const max_tokens = settings?.maxTokens ?? 3000

    // Call Groq API with JSON Schema
    const completion = await groq.chat.completions.create({
      messages: formattedMessages,
      model: model,
      temperature: temperature,
      max_tokens: max_tokens,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'zabb_story_schema',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              status: {
                type: 'object',
                properties: {
                  date: { type: 'string' },
                  time: { type: 'string' },
                  location: { type: 'string' },
                  emotion: { type: 'string' },
                  outfit: { type: 'string' },
                  desire: { type: 'string' },
                },
                required: ['date', 'time', 'location', 'emotion', 'outfit', 'desire'],
                additionalProperties: false,
              },
              story_flow: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string', enum: ['action', 'dialogue'] },
                    text: { type: 'string' },
                  },
                  required: ['type', 'text'],
                  additionalProperties: false,
                },
              },
              internal_thought: { 
                type: 'string',
                description: 'สรุปความคิดในใจสั้นๆ ของตัวละคร' 
              },
            },
            required: ['status', 'story_flow', 'internal_thought'],
            additionalProperties: false,
          },
        },
      },
    })

    const responseContent = completion.choices[0]?.message?.content || ''

    return NextResponse.json({ content: responseContent })
  } catch (error: any) {
    console.error('Groq API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate response' },
      { status: 500 }
    )
  }
}
