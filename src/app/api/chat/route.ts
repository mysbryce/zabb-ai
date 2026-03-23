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
    try {
      coreInstruction = fs.readFileSync(instructionPath, 'utf8')
    } catch (e) {
      coreInstruction = 'You are an AI character in a roleplay engine. Format with structured JSON.'
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

    // Assemble the complete System Prompt
    const systemPrompt = `${coreInstruction}\n${characterContext}\n${userContext}`

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
